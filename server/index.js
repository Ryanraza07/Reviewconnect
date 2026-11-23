import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectDB } from './config/db.js';
import businessRoutes from './routes/businessRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAnalyticsStore } from './data/demoBusinesses.js';
import { warmupPregeneratedReviews } from './services/pregeneratedReviewService.js';

const rootEnvPath = fileURLToPath(new URL('../.env', import.meta.url));
const serverEnvPath = fileURLToPath(new URL('./.env', import.meta.url));

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath });

const app = express();
const port = Number(process.env.PORT || 5000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../client/dist');

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
});

app.use('/api', publicLimiter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/landing-page', (req, res) => {
  const analyticsStore = getAnalyticsStore();
  analyticsStore.push({
    eventType: 'landing-page-visit',
    businessSlug: 'review-connect',
    metadata: { path: '/' },
    createdAt: new Date().toISOString()
  });
  res.json({ message: 'Review Connect landing page loaded.' });
});

app.use('/api/businesses', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(errorHandler);

connectDB().then(() => {
  warmupPregeneratedReviews();
  app.listen(port, () => {
    console.log(`Review Connect API running on http://localhost:${port}`);
  });
});
