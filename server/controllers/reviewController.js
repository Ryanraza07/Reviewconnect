import { z } from 'zod';
import { generateReviewWithFallback, normalizeReviewInput } from '../services/reviewGenerator.js';
import { getBusinessStore, getAnalyticsStore } from '../data/demoBusinesses.js';

const resolveLlmApiKey = () => process.env.GROQ_API_KEY || process.env.SENSENOVA_API_KEY || process.env.SENSONOVA_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.OPENAI_API_KEY || '';

const reviewPayload = z.object({
  businessSlug: z.string().min(2).max(80),
  selectedCategories: z.array(z.string()).default([]),
  description: z.string().max(500).optional().default(''),
  businessSummary: z.string().max(800).optional().default(''),
  businessProfileJson: z.string().max(8000).optional().default(''),
  tone: z.string().default('natural'),
  language: z.string().default('English'),
  rating: z.number().int().min(1).max(5).optional().default(5)
});

export const generateReviewForBusiness = async (req, res) => {
  const parsed = reviewPayload.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid review payload.', errors: parsed.error.flatten() });
  }

  const { businessSlug, selectedCategories, description, businessSummary, businessProfileJson, tone, language, rating } = parsed.data;
  const business = getBusinessStore().find((item) => item.slug === businessSlug);

  if (!business) {
    return res.status(404).json({ message: 'Business not found.' });
  }

  if (!selectedCategories.length && !description.trim()) {
    return res.status(400).json({
      message: 'Please add a few experience details or select at least one category before generating a review.'
    });
  }

  const normalized = normalizeReviewInput({
    businessName: business.businessName,
    businessCategory: business.category,
    selectedCategories,
    description,
    tone,
    language,
    contactName: business.contactName,
    contactPhone: business.contactNumber,
    businessLocation: business.location
  });

  const effectiveSummary = businessSummary?.trim() || business.businessSummary || business.description || '';
  const effectiveProfileJson = businessProfileJson?.trim() || business.businessProfileJson || '';
  const reviewText = await generateReviewWithFallback({
    businessCategory: normalized.businessCategory,
    selectedCategories: normalized.selectedCategories,
    description: normalized.description,
    tone: normalized.tone,
    language: normalized.language,
    businessName: normalized.businessName,
    contactName: normalized.contactName,
    contactPhone: normalized.contactPhone,
    businessLocation: normalized.businessLocation,
    businessSummary: effectiveSummary,
    businessProfileJson: effectiveProfileJson,
    llmApiKey: resolveLlmApiKey()
  });

  const analytics = getAnalyticsStore();
  analytics.push({
    eventType: 'review-generation',
    businessSlug,
    metadata: { rating, tone, language, categoryCount: selectedCategories.length },
    createdAt: new Date().toISOString()
  });

  return res.json({
    business,
    review: reviewText,
    rating,
    tone,
    language,
    selectedCategories,
    generatedAt: new Date().toISOString()
  });
};

export const trackAnalytics = (req, res) => {
  const eventType = z.string().min(2).max(80).safeParse(req.body?.eventType);
  const businessSlug = z.string().min(2).max(80).safeParse(req.body?.businessSlug || 'unknown');

  if (!eventType.success || !businessSlug.success) {
    return res.status(400).json({ message: 'Invalid analytics event payload.' });
  }

  const analytics = getAnalyticsStore();
  analytics.push({
    eventType: eventType.data,
    businessSlug: businessSlug.data,
    metadata: req.body?.metadata || {},
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ message: 'Analytics event tracked.' });
};
