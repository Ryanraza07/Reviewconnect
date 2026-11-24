import { z } from 'zod';
import { getBusinessStore, loadBusinessesFromDb, persistBusinessStore } from '../data/demoBusinesses.js';
import Business from '../models/Business.js';
import { getDefaultReviewCategories } from '../services/reviewGenerator.js';
import { generateAdvanceReview, getAndConsumePregeneratedReview } from '../services/pregeneratedReviewService.js';

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const businessSchema = z.object({
  businessName: z.string().min(2).max(120),
  contactName: z.string().max(120).optional().default(''),
  contactNumber: z.string().max(40).optional().default(''),
  email: z.string().max(120).optional().default(''),
  socialLinks: z
    .object({
      website: z.string().optional().default(''),
      instagram: z.string().optional().default(''),
      facebook: z.string().optional().default(''),
      whatsapp: z.string().optional().default(''),
      twitter: z.string().optional().default(''),
      youtube: z.string().optional().default(''),
      linkedin: z.string().optional().default('')
    })
    .optional()
    .default({}),
  location: z.string().max(200).optional().default(''),
  locationLink: z.string().url().optional().or(z.literal('')).default(''),
  businessSummary: z.string().max(800).optional().default(''),
  businessProfileJson: z.string().max(8000).optional().default(''),
  slug: z.string().min(2).max(80).optional(),
  category: z.enum([
    'restaurant',
    'salon',
    'clinic',
    'general_store',
    'optical',
    'pharmacy',
    'electronics',
    'fashion',
    'gym',
    'automobile',
    'hotel'
  ]).default('restaurant'),
  description: z.string().max(500).optional().default(''),
  logo: z
    .string()
    .refine((value) => !value || /^data:image\//.test(value) || /^https?:\/\//.test(value) || value.startsWith('blob:'), {
      message: 'Logo must be a valid image URL or uploaded image data.'
    })
    .optional()
    .or(z.literal(''))
    .default(''),
  googleReviewUrl: z.string().url().optional().or(z.literal('')).default(''),
  branding: z
    .object({
      primaryColor: z.string().default('#2563eb'),
      secondaryColor: z.string().default('#0f172a')
    })
    .default({ primaryColor: '#2563eb', secondaryColor: '#0f172a' }),
  welcomeMessage: z.string().max(250).optional().default('Thanks for visiting us.'),
  supportedLanguages: z.array(z.string()).default(['English']),
  reviewCategories: z.array(z.object({ name: z.string(), key: z.string(), enabled: z.boolean().default(true) })).default([]),
  templateSettings: z.object({ enabled: z.boolean().default(true), defaultTone: z.string().default('natural') }).default({ enabled: true, defaultTone: 'natural' }),
  isActive: z.boolean().default(true)
});

export const listBusinesses = async (req, res) => {
  const businesses = await loadBusinessesFromDb();
  res.json(businesses);
};

export const getBusinessBySlug = async (req, res) => {
  const { slug } = req.params;
  const businesses = await loadBusinessesFromDb();
  const business = businesses.find((item) => item.slug === slug);

  if (!business) {
    return res.status(404).json({ message: 'Business not found.' });
  }

  let pregeneratedReview = getAndConsumePregeneratedReview(business);
  if (!pregeneratedReview) {
    try {
      pregeneratedReview = await generateAdvanceReview(business);
    } catch {
      pregeneratedReview = null;
    }
  }

  return res.json({
    ...business,
    pregeneratedReview
  });
};

export const createBusiness = async (req, res) => {
  const parsed = businessSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid business payload.', errors: parsed.error.flatten() });
  }

  const store = getBusinessStore();
  const payload = parsed.data;
  const resolvedSlug = slugify(payload.slug || payload.businessName);

  if (store.some((item) => item.slug === resolvedSlug)) {
    return res.status(409).json({ message: 'A business with this slug already exists.' });
  }

  if (Business.db && Business.db.readyState === 1) {
    const newBusiness = await Business.create({
      ...payload,
      slug: resolvedSlug,
      reviewCategories: payload.reviewCategories.length
        ? payload.reviewCategories
        : getDefaultReviewCategories(payload.category || 'restaurant'),
      isActive: payload.isActive ?? true
    });

    const normalizedBusiness = {
      ...newBusiness.toObject(),
      id: String(newBusiness._id),
      _id: undefined
    };

    const nextBusinesses = [normalizedBusiness, ...getBusinessStore().filter((item) => item.slug !== normalizedBusiness.slug)];
    globalThis.__reviewConnectBusinesses = nextBusinesses;
    persistBusinessStore();
    return res.status(201).json(normalizedBusiness);
  }

  const newBusiness = {
    id: `biz-${Date.now()}`,
    ...payload,
    slug: resolvedSlug,
    reviewCategories: payload.reviewCategories.length
      ? payload.reviewCategories
      : getDefaultReviewCategories(payload.category || 'restaurant'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.unshift(newBusiness);
  persistBusinessStore();
  return res.status(201).json(newBusiness);
};

export const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const store = getBusinessStore();
  const index = store.findIndex((item) => item.id === id);

  if (index === -1) {
    const dbRecord = await Business.findById(id);
    if (!dbRecord) {
      return res.status(404).json({ message: 'Business not found.' });
    }
  }

  const parsed = businessSchema.safeParse({ ...store[index] || {}, ...req.body });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid update payload.', errors: parsed.error.flatten() });
  }

  if (Business.db && Business.db.readyState === 1) {
    const updatedDoc = await Business.findByIdAndUpdate(
      id,
      {
        ...parsed.data,
        slug: slugify(parsed.data.slug || parsed.data.businessName || id),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    const updated = {
      ...updatedDoc.toObject(),
      id: String(updatedDoc._id),
      _id: undefined
    };

    globalThis.__reviewConnectBusinesses = [updated, ...getBusinessStore().filter((item) => item.id !== id)];
    persistBusinessStore();
    return res.json(updated);
  }

  const updated = {
    ...store[index],
    ...parsed.data,
    slug: slugify(parsed.data.slug || parsed.data.businessName || store[index].slug),
    updatedAt: new Date().toISOString()
  };

  store[index] = updated;
  persistBusinessStore();
  return res.json(updated);
};

export const deleteBusiness = async (req, res) => {
  const { id } = req.params;
  const store = getBusinessStore();

  if (Business.db && Business.db.readyState === 1) {
    const deleted = await Business.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    globalThis.__reviewConnectBusinesses = store.filter((item) => item.id !== id);
    persistBusinessStore();
    return res.json({ message: 'Business deleted successfully.' });
  }

  const nextBusinesses = store.filter((item) => item.id !== id);

  if (nextBusinesses.length === store.length) {
    return res.status(404).json({ message: 'Business not found.' });
  }

  globalThis.__reviewConnectBusinesses = nextBusinesses;
  persistBusinessStore();
  return res.json({ message: 'Business deleted successfully.' });
};
