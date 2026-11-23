import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReviewGenerationPrompt,
  generateReview,
  generateReviewWithFallback,
  getDefaultReviewCategories,
  normalizeReviewInput
} from '../services/reviewGenerator.js';

test('filters categories and avoids duplicates', () => {
  const normalized = normalizeReviewInput({
    businessName: 'Royal Salon Studio',
    businessCategory: 'salon',
    selectedCategories: ['staff', 'staff', 'pricing'],
    tone: 'friendly',
    language: 'Hindi',
    description: 'Service was polite and the price felt fair.'
  });

  assert.equal(normalized.businessCategory, 'salon');
  assert.equal(normalized.language, 'hindi');
  assert.deepEqual(normalized.selectedCategories, ['staff', 'affordability']);
});

test('offers an expanded review category catalog with Hinglish-first defaults', () => {
  const categories = getDefaultReviewCategories('restaurant');

  assert.ok(categories.length >= 10);
  assert.ok(categories.some((item) => item.key === 'staff' && item.name === 'Staff behaviour'));
  assert.ok(categories.some((item) => item.key === 'overall' && item.name === 'Overall experience'));
  assert.ok(categories.some((item) => item.key === 'ambience'));
  assert.ok(categories.some((item) => item.key === 'hygiene'));
  assert.ok(categories.some((item) => item.key === 'service'));
});

test('prefers Hinglish when no language is supplied', () => {
  const normalized = normalizeReviewInput({
    businessName: 'The Coffee House',
    businessCategory: 'restaurant',
    selectedCategories: ['staff', 'overall', 'service'],
    tone: 'natural',
    description: 'The staff was polite and the place felt fresh.'
  });

  assert.equal(normalized.language, 'hinglish');
  assert.ok(normalized.selectedCategories.length >= 3);
});

test('builds a prompt that includes selected tags and business details without business json', () => {
  const prompt = buildReviewGenerationPrompt({
    businessName: 'Moonville Rooftop',
    businessCategory: 'restaurant',
    businessLocation: 'Chandhasi, DDU Nagar',
    selectedCategories: ['ambience', 'service'],
    description: 'The team was polite and the ambience was excellent.',
    tone: 'natural',
    language: 'English'
  });

  assert.match(prompt, /ambience/i);
  assert.match(prompt, /service/i);
  assert.match(prompt, /Moonville Rooftop/i);
  assert.match(prompt, /Generate a 100% unique/i);
  assert.doesNotMatch(prompt, /businessProfileJson/i);
  assert.doesNotMatch(prompt, /Business context:/i);
});

test('generates an AI review via custom llmRequest', async () => {
  const result = await generateReviewWithFallback({
    businessName: 'The Coffee House',
    businessCategory: 'restaurant',
    selectedCategories: ['staff', 'foodquality'],
    tone: 'natural',
    language: 'English',
    llmRequest: async ({ prompt }) => {
      assert.ok(prompt.includes('The Coffee House'));
      return 'Great coffee, fresh snacks, and the staff was very welcoming!';
    }
  });

  assert.equal(result, 'Great coffee, fresh snacks, and the staff was very welcoming!');
});

test('strictly throws an error when AI providers are unavailable (no local fallback)', async () => {
  await assert.rejects(
    async () => {
      await generateReviewWithFallback({
        businessName: 'The Coffee House',
        businessCategory: 'restaurant',
        selectedCategories: ['staff'],
        llmApiKey: '',
        geminiApiKey: '',
        senseNovaApiKey: ''
      });
    },
    /AI review generation failed/i
  );
});

test('strictly throws an error when custom llmRequest fails (no local fallback)', async () => {
  await assert.rejects(
    async () => {
      await generateReviewWithFallback({
        businessName: 'The Coffee House',
        businessCategory: 'restaurant',
        selectedCategories: ['staff'],
        llmRequest: async () => {
          throw new Error('LLM provider unreachable');
        }
      });
    },
    /LLM provider unreachable|AI review generation failed/i
  );
});

test('generateReview throws explicit error that local generation has been removed', () => {
  assert.throws(
    () => generateReview(),
    /Local review generation has been removed/i
  );
});

test('tag catalogs exist across restaurant, salon, and clinic categories', () => {
  const restaurantTags = getDefaultReviewCategories('restaurant');
  const salonTags = getDefaultReviewCategories('salon');
  const clinicTags = getDefaultReviewCategories('clinic');

  assert.ok(restaurantTags.length >= 10);
  assert.ok(salonTags.length >= 10);
  assert.ok(clinicTags.length >= 10);
});
