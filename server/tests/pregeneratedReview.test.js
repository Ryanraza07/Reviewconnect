import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAndConsumePregeneratedReview,
  hasPregeneratedReview,
  setPregeneratedReview,
  clearPregeneratedCache
} from '../services/pregeneratedReviewService.js';

const mockBusiness = {
  slug: 'test-cafe',
  businessName: 'Test Cafe',
  category: 'restaurant',
  location: 'Indiranagar, Bangalore',
  reviewCategories: [
    { key: 'taste', name: 'Taste', enabled: true },
    { key: 'ambience', name: 'Ambience', enabled: true },
    { key: 'service', name: 'Service', enabled: true }
  ],
  supportedLanguages: ['English', 'Hinglish'],
  templateSettings: { defaultTone: 'natural' }
};

test('pregeneratedReviewService returns null when cache is empty without local fallback', () => {
  clearPregeneratedCache();

  // Initially empty cache
  assert.equal(hasPregeneratedReview('test-cafe'), false);

  // Consume pregenerated review when empty: returns null (no local fallback templates)
  const result1 = getAndConsumePregeneratedReview(mockBusiness);
  assert.equal(result1, null);
});

test('pregeneratedReviewService delivers cached AI review instantly and consumes it', () => {
  clearPregeneratedCache();

  // Prime cache with an advance AI review
  setPregeneratedReview('test-cafe', {
    review: 'Had an amazing coffee at Test Cafe in Indiranagar. Fast service and lovely ambience!',
    selectedCategories: ['taste', 'ambience'],
    tone: 'natural',
    language: 'English',
    rating: 5,
    generatedAt: new Date().toISOString(),
    source: 'llm-advance'
  });

  // Cache is now primed
  assert.equal(hasPregeneratedReview('test-cafe'), true);

  // Consumer gets the advance AI review instantly from cache
  const result = getAndConsumePregeneratedReview(mockBusiness);

  assert.ok(result);
  assert.equal(result.cached, true);
  assert.equal(result.source, 'llm-advance');
  assert.ok(result.review.includes('Test Cafe'));

  // Once consumed, the cache is exhausted
  assert.equal(hasPregeneratedReview('test-cafe'), false);
});
