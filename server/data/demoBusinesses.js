import fs from 'node:fs';
import path from 'node:path';

import { isDbConnected } from '../config/db.js';
import Business from '../models/Business.js';
import { getDefaultReviewCategories } from '../services/reviewGenerator.js';

const businessStorePath = path.resolve(process.cwd(), 'server/data/businessStore.json');

const demoBusinesses = [
  {
    id: 'biz-restaurant',
    businessName: 'The Coffee House',
    contactName: 'Aisha Khan',
    contactNumber: '+91 98765 43210',
    email: 'contact@thecoffeehouse.in',
    socialLinks: {
      website: 'https://thecoffeehouse.in',
      instagram: 'https://instagram.com/thecoffeehouse',
      facebook: 'https://facebook.com/thecoffeehouse',
      whatsapp: '+91 98765 43210',
      twitter: 'https://x.com/thecoffeehouse',
      youtube: 'https://youtube.com/@thecoffeehouse'
    },
    location: 'Connaught Place, New Delhi',
    locationLink: 'https://maps.google.com/?q=Connaught+Place+New+Delhi',
    businessSummary: 'Neighborhood café known for artisan coffee, light brunch, and a warm modern atmosphere.',
    businessProfileJson: JSON.stringify({
      business_name: 'The Coffee House',
      category: 'Cafe',
      location: 'Connaught Place, New Delhi',
      cuisine: ['Coffee', 'Brunch', 'Desserts'],
      specialties: ['Artisan coffee', 'Sandwiches', 'Signature brunch'],
      experience_highlights: ['Warm ambience', 'Casual seating', 'Great coffee'],
      customer_feedback_themes: {
        positive: ['Ambience', 'Coffee quality', 'Service'],
        mixed_or_negative: ['Crowded hours', 'Wait times']
      },
      estimated_price_for_two: '₹800-₹1200'
    }),
    slug: 'the-coffee-house',
    category: 'restaurant',
    description: 'A neighborhood café for coffee, brunch, and casual dining.',
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
    googleReviewUrl: 'https://www.google.com/search?q=The+Coffee+House+reviews',
    branding: { primaryColor: '#2563eb', secondaryColor: '#0f172a' },
    welcomeMessage: 'Thanks for visiting us. We’d love to hear about your experience.',
    supportedLanguages: ['English', 'Hindi', 'Hinglish'],
    reviewCategories: getDefaultReviewCategories('restaurant'),
    templateSettings: { enabled: true, defaultTone: 'natural' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'biz-salon',
    businessName: 'Royal Salon Studio',
    contactName: 'Meera Sharma',
    contactNumber: '+91 99887 66554',
    email: 'info@royalsalonstudio.com',
    socialLinks: {
      website: 'https://royalsalonstudio.com',
      instagram: 'https://instagram.com/royalsalonstudio',
      facebook: 'https://facebook.com/royalsalonstudio',
      whatsapp: '+91 99887 66554'
    },
    location: 'Banjara Hills, Hyderabad',
    locationLink: 'https://maps.google.com/?q=Banjara+Hills+Hyderabad',
    businessSummary: 'Premium salon specializing in hairstyling, grooming, and confidence-boosting personal care.',
    businessProfileJson: JSON.stringify({
      business_name: 'Royal Salon Studio',
      category: 'Salon',
      location: 'Banjara Hills, Hyderabad',
      cuisine: [],
      specialties: ['Hair styling', 'Hair spa', 'Grooming'],
      experience_highlights: ['Professional team', 'Modern styling', 'Comfortable service'],
      customer_feedback_themes: {
        positive: ['Styling', 'Professionalism', 'Service'],
        mixed_or_negative: ['Appointment delays']
      },
      estimated_price_for_two: '₹1500-₹2500'
    }),
    slug: 'royal-salon-studio',
    category: 'salon',
    description: 'A premium salon for hair styling, grooming, and personal care.',
    logo: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=200&q=80',
    googleReviewUrl: 'https://www.google.com/search?q=Royal+Salon+Studio+reviews',
    branding: { primaryColor: '#a855f7', secondaryColor: '#1f2937' },
    welcomeMessage: 'We value your honest feedback and would love to know how we did.',
    supportedLanguages: ['English', 'Hindi', 'Hinglish'],
    reviewCategories: getDefaultReviewCategories('salon'),
    templateSettings: { enabled: true, defaultTone: 'friendly' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'biz-clinic',
    businessName: 'City Dental Clinic',
    contactName: 'Dr. Rohan Mehta',
    contactNumber: '+91 91234 56789',
    email: 'care@citydentalclinic.com',
    socialLinks: {
      website: 'https://citydentalclinic.com',
      instagram: 'https://instagram.com/citydentalclinic',
      whatsapp: '+91 91234 56789'
    },
    location: 'Koramangala, Bengaluru',
    locationLink: 'https://maps.google.com/?q=Koramangala+Bengaluru',
    businessSummary: 'Modern dental clinic focused on preventive care, restorative treatments, and a calm patient experience.',
    businessProfileJson: JSON.stringify({
      business_name: 'City Dental Clinic',
      category: 'Clinic',
      location: 'Koramangala, Bengaluru',
      cuisine: [],
      specialties: ['Dental consultation', 'Teeth whitening', 'Preventive care'],
      experience_highlights: ['Calm environment', 'Professional doctors', 'Comfortable care'],
      customer_feedback_themes: {
        positive: ['Professionalism', 'Cleanliness', 'Ease of consultation'],
        mixed_or_negative: ['Waiting time']
      },
      estimated_price_for_two: '₹1200-₹3000'
    }),
    slug: 'city-dental-clinic',
    category: 'clinic',
    description: 'A modern dental clinic focused on preventive and restorative care.',
    logo: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=200&q=80',
    googleReviewUrl: 'https://www.google.com/search?q=City+Dental+Clinic+reviews',
    branding: { primaryColor: '#14b8a6', secondaryColor: '#0f172a' },
    welcomeMessage: 'Your feedback helps us improve the care and comfort we provide.',
    supportedLanguages: ['English', 'Hindi', 'Hinglish'],
    reviewCategories: getDefaultReviewCategories('clinic'),
    templateSettings: { enabled: true, defaultTone: 'professional' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'biz-general-store',
    businessName: 'Prime Daily Mart & General Store',
    contactName: 'Suresh Kumar',
    contactNumber: '+91 98450 12345',
    email: 'support@primedailymart.in',
    socialLinks: {
      whatsapp: '+91 98450 12345'
    },
    location: 'Indiranagar, Bengaluru',
    locationLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
    businessSummary: 'Well-stocked neighborhood supermarket providing fresh groceries, packaged food, household essentials, and speedy checkout.',
    businessProfileJson: JSON.stringify({
      business_name: 'Prime Daily Mart & General Store',
      category: 'General Store',
      location: 'Indiranagar, Bengaluru',
      specialties: ['Daily groceries', 'Fresh supplies', 'Household essentials'],
      experience_highlights: ['Organized aisles', 'Fast billing', 'Wide product range'],
      customer_feedback_themes: {
        positive: ['Stock availability', 'Billing speed', 'Fair pricing'],
        mixed_or_negative: ['Peak hour rush']
      }
    }),
    slug: 'prime-daily-mart',
    category: 'general_store',
    description: 'A well-stocked general store and supermarket for daily essentials and groceries.',
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80',
    googleReviewUrl: 'https://www.google.com/search?q=Prime+Daily+Mart+reviews',
    branding: { primaryColor: '#16a34a', secondaryColor: '#0f172a' },
    welcomeMessage: 'Thank you for shopping with us! Please share your experience.',
    supportedLanguages: ['English', 'Hindi', 'Hinglish'],
    reviewCategories: getDefaultReviewCategories('general_store'),
    templateSettings: { enabled: true, defaultTone: 'natural' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'biz-optical',
    businessName: 'Vision Care Opticals & Eyewear',
    contactName: 'Rajesh Sen',
    contactNumber: '+91 98300 54321',
    email: 'hello@visioncareopticals.com',
    socialLinks: {
      whatsapp: '+91 98300 54321',
      instagram: 'https://instagram.com/visioncareopticals'
    },
    location: 'Park Street, Kolkata',
    locationLink: 'https://maps.google.com/?q=Park+Street+Kolkata',
    businessSummary: 'Modern optical boutique offering computerized eye testing, designer frames, precision prescription lenses, and custom fitting.',
    businessProfileJson: JSON.stringify({
      business_name: 'Vision Care Opticals & Eyewear',
      category: 'Optical Shop',
      location: 'Park Street, Kolkata',
      specialties: ['Eye testing', 'Prescription glasses', 'Designer sunglasses'],
      experience_highlights: ['Accurate eye checkup', 'Wide frame collection', 'Quick delivery'],
      customer_feedback_themes: {
        positive: ['Testing accuracy', 'Frame collection', 'Staff guidance'],
        mixed_or_negative: ['Limited parking']
      }
    }),
    slug: 'vision-care-opticals',
    category: 'optical',
    description: 'Specialist eyewear and optical shop providing precision eye tests and stylish frames.',
    logo: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=200&q=80',
    googleReviewUrl: 'https://www.google.com/search?q=Vision+Care+Opticals+reviews',
    branding: { primaryColor: '#0284c7', secondaryColor: '#0f172a' },
    welcomeMessage: 'Thank you for choosing Vision Care. We would love your feedback on your glasses and service.',
    supportedLanguages: ['English', 'Hindi', 'Hinglish'],
    reviewCategories: getDefaultReviewCategories('optical'),
    templateSettings: { enabled: true, defaultTone: 'natural' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const normalizeBusinessRecord = (business) => {
  const plain = business?.toObject ? business.toObject() : { ...business };
  return {
    ...plain,
    id: String(plain._id || plain.id || `biz-${Date.now()}`),
    _id: undefined
  };
};

const ensureBusinessStoreFile = () => {
  const directory = path.dirname(businessStorePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(businessStorePath)) {
    fs.writeFileSync(businessStorePath, JSON.stringify(demoBusinesses, null, 2));
  }
};

const readBusinessStoreFile = () => {
  ensureBusinessStoreFile();

  try {
    const raw = fs.readFileSync(businessStorePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Could not read business store file. Falling back to demo data.');
    return [];
  }
};

const persistBusinessStore = () => {
  try {
    ensureBusinessStoreFile();
    fs.writeFileSync(businessStorePath, JSON.stringify(getBusinessStore(), null, 2));
  } catch (error) {
    console.warn('Could not persist businesses to disk.', error.message);
  }
};

const getBusinessStore = () => {
  if (!globalThis.__reviewConnectBusinesses) {
    const persistedBusinesses = readBusinessStoreFile();
    globalThis.__reviewConnectBusinesses = persistedBusinesses.length ? persistedBusinesses : structuredClone(demoBusinesses);
    persistBusinessStore();
  }
  return globalThis.__reviewConnectBusinesses;
};

const loadBusinessesFromDb = async () => {
  if (!isDbConnected()) {
    return getBusinessStore();
  }

  const totalBusinesses = await Business.countDocuments();
  if (totalBusinesses === 0) {
    await Business.insertMany(demoBusinesses.map(({ id, ...business }) => ({ ...business })));
  }

  const businesses = await Business.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  globalThis.__reviewConnectBusinesses = businesses.map((business) => normalizeBusinessRecord(business));
  persistBusinessStore();
  return globalThis.__reviewConnectBusinesses;
};

const getAnalyticsStore = () => {
  if (!globalThis.__reviewConnectAnalytics) {
    globalThis.__reviewConnectAnalytics = [];
  }
  return globalThis.__reviewConnectAnalytics;
};

export { demoBusinesses, getBusinessStore, loadBusinessesFromDb, getAnalyticsStore, persistBusinessStore };
