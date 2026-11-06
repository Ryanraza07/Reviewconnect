import express from 'express';
import { getAdminAnalytics, getAdminBusinesses, getBusinessAnalytics, loginAdmin } from '../controllers/adminController.js';
import { createBusiness, deleteBusiness, updateBusiness } from '../controllers/businessController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/auth/login', loginAdmin);
router.get('/businesses', requireAuth, getAdminBusinesses);
router.post('/businesses', requireAuth, createBusiness);
router.put('/businesses/:id', requireAuth, updateBusiness);
router.delete('/businesses/:id', requireAuth, deleteBusiness);
router.get('/analytics', requireAuth, getAdminAnalytics);
router.get('/businesses/:id/analytics', requireAuth, getBusinessAnalytics);

export default router;
