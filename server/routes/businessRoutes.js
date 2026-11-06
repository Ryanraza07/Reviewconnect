import express from 'express';
import { getBusinessBySlug, listBusinesses } from '../controllers/businessController.js';

const router = express.Router();

router.get('/', listBusinesses);
router.get('/:slug', getBusinessBySlug);

export default router;
