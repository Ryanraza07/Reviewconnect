import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReviewGenerationPrompt, generateReview, generateReviewWithFallback, getDefaultReviewCategories, normalizeReviewInput } from '../services/reviewGenerator.js';

test('generates a valid restaurant review in english', () => {
  const review = generateReview({
    businessCategory: 'restaurant',
    selectedCategories: ['foodquality', 'ambience'],
    tone: 'natural',
    language: 'English',
    businessName: 'The Coffee House',
    description: 'The coffee was smooth and the place felt welcoming.'
  });

  assert.ok(review.includes('The Coffee House'));
  assert.ok(review.length > 50);
  assert.ok(!review.includes('AI'));
});

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

test('reuses multilingual templates for hinglish', () => {
  const review = generateReview({
    businessCategory: 'clinic',
    selectedCategories: ['doctorcommunication'],
    tone: 'professional',
    language: 'Hinglish',
    businessName: 'City Dental Clinic',
    description: 'Doctor explained treatment clearly.'
  });

  assert.ok(review.length > 40);
  assert.ok(review.toLowerCase().includes('city dental clinic') || review.includes('City Dental Clinic'));
});

test('supports neutral and negative phrasing without claiming false positivity', () => {
  const review = generateReview({
    businessCategory: 'restaurant',
    selectedCategories: ['service'],
    tone: 'simple',
    language: 'English',
    businessName: 'The Diner',
    description: 'It took a while to get served.'
  });

  assert.ok(review.length > 20);
  assert.ok(!review.includes('I absolutely loved it'));
});

test('keeps generated reviews concise, randomized, and SEO-friendly', () => {
  const reviews = Array.from({ length: 40 }, () => generateReview({
    businessCategory: 'restaurant',
    selectedCategories: ['foodquality', 'ambience', 'location'],
    tone: 'natural',
    language: 'English',
    businessName: 'Bluebird Café',
    businessLocation: 'Banjara Hills, Hyderabad',
    description: 'Good coffee, warm ambience, and easy parking near the city center.'
  }));

  const tagged = reviews.filter((review) => review.includes('Bluebird Café') && review.includes('Banjara Hills, Hyderabad'));

  assert.ok(tagged.length >= 35);
  assert.ok(reviews.every((review) => review.length >= 70 && review.length <= 180));
  assert.ok(new Set(reviews).size > 25);
});

test('keeps location details in generated reviews without injecting the contact name', () => {
  const review = generateReview({
    businessCategory: 'restaurant',
    selectedCategories: ['staff', 'overall'],
    tone: 'natural',
    language: 'English',
    businessName: 'The Green Table',
    contactName: 'Aisha Khan',
    contactPhone: '+91 98765 43210',
    businessLocation: 'Connaught Place, Delhi',
    description: 'The team was attentive and the setup was warm.'
  });

  assert.ok(review.includes('The Green Table'));
  assert.ok(!review.includes('Aisha Khan'));
  assert.ok(review.includes('Connaught Place, Delhi'));
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

test('builds a prompt that includes selected tags and the business profile json', () => {
  const prompt = buildReviewGenerationPrompt({
    businessName: 'Moonville Rooftop',
    businessCategory: 'restaurant',
    selectedCategories: ['ambience', 'service'],
    businessProfileJson: JSON.stringify({
      business_name: 'Moonville Rooftop',
      category: 'Rooftop Restaurant',
      location: 'Chandhasi, DDU Nagar, Mughalsarai',
      cuisine: ['North Indian', 'Mughlai'],
      specialties: ['Paneer gravies', 'Tandoori starters'],
      experience_highlights: ['Rooftop ambience', 'Family dining'],
      customer_feedback_themes: { positive: ['Ambience', 'Food presentation'] }
    }),
    description: 'The team was polite and the ambience was excellent.',
    tone: 'natural',
    language: 'English'
  });

  assert.match(prompt, /ambience/i);
  assert.match(prompt, /service/i);
  assert.match(prompt, /Moonville Rooftop/i);
  assert.match(prompt, /Generate a customer review/i);
  assert.match(prompt, /North Indian/i);
});

test('falls back to local generation when LLM generation is unavailable', async () => {
  const result = await generateReviewWithFallback({
    businessName: 'The Coffee House',
    businessCategory: 'restaurant',
    selectedCategories: ['staff'],
    description: 'The staff was warm and helpful.',
    tone: 'natural',
    language: 'English',
    businessSummary: 'Warm neighborhood café with quality coffee.',
    llmApiKey: '',
    llmRequest: async () => {
      throw new Error('LLM unavailable');
    }
  });

  assert.ok(result.includes('The Coffee House'));
  assert.ok(result.length > 20);
});

test('waits for the LLM timeout before switching to local generation', async () => {
  const startedAt = Date.now();

  const result = await generateReviewWithFallback({
    businessName: 'Skyline Bistro',
    businessCategory: 'restaurant',
    selectedCategories: ['staff', 'ambience'],
    description: 'The staff made the evening feel easy and welcoming.',
    tone: 'friendly',
    language: 'Hinglish',
    businessSummary: 'A lively neighborhood spot with warm service.',
    llmApiKey: 'dummy-key',
    llmRequest: async () => {
      await new Promise((resolve) => setTimeout(resolve, 20500));
      return 'late llm output';
    }
  });

  const elapsedMs = Date.now() - startedAt;
  assert.ok(elapsedMs >= 20000, `Expected fallback after 20s, but elapsed ${elapsedMs}ms`);
  assert.ok(result.includes('Skyline Bistro'));
  assert.ok(result.length > 20);
});

test('keeps generated reviews varied across repeated runs and exposes enough tag choices', () => {
  const restaurantTags = getDefaultReviewCategories('restaurant');
  const salonTags = getDefaultReviewCategories('salon');
  const clinicTags = getDefaultReviewCategories('clinic');

  assert.ok(restaurantTags.length >= 10);
  assert.ok(salonTags.length >= 10);
  assert.ok(clinicTags.length >= 10);

  const reviews = Array.from({ length: 100 }, () => generateReview({
    businessCategory: 'restaurant',
    selectedCategories: ['staff', 'ambience', 'foodquality', 'service'],
    tone: 'natural',
    language: 'Hinglish',
    businessName: 'The Coffee House',
    description: 'Staff was polite, the ambience felt warm, and service was smooth.'
  }));

  assert.ok(new Set(reviews).size > 80);
});
