import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateReviewWithFallback, getDefaultReviewCategories } from './reviewGenerator.js';
import { getBusinessStore, loadBusinessesFromDb } from '../data/demoBusinesses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = path.resolve(__dirname, '../data/pregeneratedReviews.json');

// In-memory cache: slug -> { review, selectedCategories, tone, language, rating, generatedAt, source }
if (!globalThis.__reviewConnectPregeneratedCache) {
  globalThis.__reviewConnectPregeneratedCache = new Map();
}
const pregeneratedCache = globalThis.__reviewConnectPregeneratedCache;

// Tracks businesses currently undergoing background advance generation to prevent duplicate concurrent calls
if (!globalThis.__reviewConnectInFlightGenerations) {
  globalThis.__reviewConnectInFlightGenerations = new Set();
}
const inFlightGenerations = globalThis.__reviewConnectInFlightGenerations;

const loadPersistedCache = () => {
  try {
    if (fs.existsSync(storagePath)) {
      const raw = fs.readFileSync(storagePath, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        for (const [slug, item] of Object.entries(data)) {
          if (item && item.review) {
            pregeneratedCache.set(slug, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Pregenerator] Could not load persisted pregenerated reviews:', err?.message || err);
  }
};

const persistCache = () => {
  try {
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj = {};
    for (const [slug, item] of pregeneratedCache.entries()) {
      obj[slug] = item;
    }
    fs.writeFileSync(storagePath, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Pregenerator] Could not persist pregenerated reviews to disk:', err?.message || err);
  }
};

// Initial load on import
loadPersistedCache();

/**
 * Helper to select 1-2 random enabled review categories for a business.
 */
const pickRandomCategories = (business) => {
  const enabled = (business?.reviewCategories || [])
    .filter((item) => item.enabled)
    .map((item) => item.key);

  const fallbackCategories = getDefaultReviewCategories(business?.category || 'restaurant')
    .map((c) => c.key);

  const pool = enabled.length ? enabled : fallbackCategories;
  const count = Math.min(2, Math.max(1, pool.length > 2 ? 2 : pool.length));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Asynchronously generates 1 review in the background in advance for a business.
 * When complete, stores it in the pregeneratedCache so the next visitor or regeneration gets it instantly.
 */
export async function generateAdvanceReview(business) {
  const slug = business?.slug;
  if (!slug) return null;

  if (inFlightGenerations.has(slug)) {
    return null;
  }

  inFlightGenerations.add(slug);

  try {
    const selectedCategories = pickRandomCategories(business);
    const tone = business.templateSettings?.defaultTone || 'natural';
    const preferredLanguage = business.supportedLanguages?.length
      ? (business.supportedLanguages.includes('Hinglish') ? 'Hinglish' : business.supportedLanguages[0])
      : 'Hinglish';

    const reviewText = await generateReviewWithFallback({
      businessName: business.businessName,
      businessCategory: business.category,
      selectedCategories,
      tone,
      language: preferredLanguage,
      businessLocation: business.location
    });

    const item = {
      review: String(reviewText || '').trim(),
      selectedCategories,
      tone,
      language: preferredLanguage,
      rating: 5,
      generatedAt: new Date().toISOString(),
      source: 'llm-advance'
    };

    pregeneratedCache.set(slug, item);
    persistCache();
    console.info(`[Pregenerator] Fresh advance review generated for "${slug}".`);
    return item;
  } catch (err) {
    console.warn(`[Pregenerator] Background AI generation failed for "${slug}":`, err?.message || err);
    // Local generation removed: do not populate buffer with mock/fallback reviews
    return null;
  } finally {
    inFlightGenerations.delete(slug);
  }
}

/**
 * Non-blocking schedule of background review generation in advance.
 */
export function scheduleAdvanceGeneration(business) {
  if (!business?.slug) return;
  setImmediate(() => {
    generateAdvanceReview(business).catch((err) => {
      console.warn(`[Pregenerator] Unhandled error during advance generation for "${business?.slug}":`, err?.message || err);
    });
  });
}

/**
 * Returns the currently pregenerated review and consumes it (exhausts it).
 * Whenever it gets exhausted, automatically triggers background generation of the next review in advance!
 */
export function getAndConsumePregeneratedReview(business) {
  const slug = business?.slug;
  if (!slug) return null;

  let reviewItem = pregeneratedCache.get(slug);

  if (reviewItem && reviewItem.review) {
    // Review is consumed / exhausted!
    pregeneratedCache.delete(slug);
    persistCache();

    // Trigger background generation of the next review in advance!
    scheduleAdvanceGeneration(business);

    return {
      ...reviewItem,
      cached: true
    };
  }

  // If buffer had none (e.g. freshly started or consumed before background finished),
  // schedule advance generation and return null (no local fallback templates!)
  scheduleAdvanceGeneration(business);
  return null;
}

/**
 * Directly primes or sets a pregenerated review into cache (used for testing or explicit priming)
 */
export function setPregeneratedReview(slug, item) {
  if (slug && item) {
    pregeneratedCache.set(slug, item);
    persistCache();
  }
}

/**
 * Check if a pregenerated review is ready in cache for this slug.
 */
export function hasPregeneratedReview(slug) {
  return Boolean(slug && pregeneratedCache.has(slug));
}

/**
 * Warm up pregenerated reviews for all active businesses on startup.
 */
export async function warmupPregeneratedReviews() {
  try {
    const businesses = await loadBusinessesFromDb().catch(() => getBusinessStore());
    console.info(`[Pregenerator] Warming up pregenerated reviews for ${businesses.length} businesses...`);

    for (const business of businesses) {
      if (!business?.slug) continue;
      if (!pregeneratedCache.has(business.slug)) {
        // Trigger background generation for each business that doesn't have one ready
        scheduleAdvanceGeneration(business);
      }
    }
  } catch (err) {
    console.warn('[Pregenerator] Warmup error:', err?.message || err);
  }
}

/**
 * Clear pregenerated cache (helper for tests)
 */
export function clearPregeneratedCache() {
  pregeneratedCache.clear();
  inFlightGenerations.clear();
}
