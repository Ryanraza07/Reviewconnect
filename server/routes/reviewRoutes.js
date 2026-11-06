import express from 'express';
import { generateReviewForBusiness, trackAnalytics } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/generate', generateReviewForBusiness);
router.post('/track', trackAnalytics);

export default router;
