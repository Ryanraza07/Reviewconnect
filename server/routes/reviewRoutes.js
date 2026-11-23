import express from 'express';
import { generateReviewForBusiness, getPregeneratedReviewForBusiness, trackAnalytics } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/generate', generateReviewForBusiness);
router.get('/pregenerated/:slug', getPregeneratedReviewForBusiness);
router.post('/track', trackAnalytics);

export default router;
