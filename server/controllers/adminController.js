import jwt from 'jsonwebtoken';
import { getAnalyticsStore, getBusinessStore, loadBusinessesFromDb } from '../data/demoBusinesses.js';

export const loginAdmin = (req, res) => {
  const { email, password } = req.body || {};

  if (
    email !== (process.env.ADMIN_EMAIL || 'admin@reviewconnect.dev') ||
    password !== (process.env.ADMIN_PASSWORD || 'admin123')
  ) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h'
  });

  return res.json({ token, admin: { email } });
};

export const getAdminBusinesses = async (req, res) => {
  const businesses = await loadBusinessesFromDb();
  return res.json(businesses);
};

export const getAdminAnalytics = (req, res) => {
  const analytics = getAnalyticsStore();
  const summary = {
    totalEvents: analytics.length,
    landingPageVisits: analytics.filter((item) => item.eventType === 'landing-page-visit').length,
    reviewGenerations: analytics.filter((item) => item.eventType === 'review-generation').length,
    reviewCopies: analytics.filter((item) => item.eventType === 'review-copy').length,
    googleClicks: analytics.filter((item) => item.eventType === 'google-review-click').length,
    recentEvents: analytics.slice(-10).reverse()
  };

  return res.json(summary);
};

export const getBusinessAnalytics = async (req, res) => {
  const { id } = req.params;
  const analytics = getAnalyticsStore();
  const business = (await loadBusinessesFromDb()).find((item) => item.id === id);

  if (!business) {
    return res.status(404).json({ message: 'Business not found.' });
  }

  const entries = analytics.filter((item) => item.businessSlug === business.slug);
  return res.json({
    business: business.businessName,
    totalEvents: entries.length,
    events: entries.slice(-20).reverse()
  });
};
