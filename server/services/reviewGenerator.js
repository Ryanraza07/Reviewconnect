import OpenAI from 'openai';

const languageMap = {
  english: 'english',
  hindi: 'hindi',
  hinglish: 'hinglish'
};

const categoryMap = {
  restaurant: 'restaurant',
  cafe: 'restaurant',
  salon: 'salon',
  clinic: 'clinic'
};

const toneMap = {
  simple: 'simple',
  short: 'simple',
  natural: 'natural',
  professional: 'professional',
  detailed: 'detailed',
  friendly: 'friendly',
  casual: 'casual'
};

const toTitleCase = (value = '') =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const resolveCategory = (value = 'restaurant') => categoryMap[String(value).toLowerCase()] || 'restaurant';
const resolveLanguage = (value = 'Hinglish') =>
  languageMap[String(value).toLowerCase()] || 'hinglish';
const resolveTone = (value = 'natural') => toneMap[String(value).toLowerCase()] || 'natural';

const categoryAliases = new Map([
  ['staff', 'staff'],
  ['staff behaviour', 'staff'],
  ['staff behavior', 'staff'],
  ['team friendliness', 'staff'],
  ['customer care', 'staff'],
  ['front desk', 'staff'],
  ['overall', 'overall'],
  ['overall experience', 'overall'],
  ['overall impression', 'overall'],
  ['visit experience', 'overall'],
  ['service', 'service'],
  ['service quality', 'service'],
  ['service speed', 'service'],
  ['food quality', 'foodquality'],
  ['foodquality', 'foodquality'],
  ['meal quality', 'foodquality'],
  ['dish quality', 'foodquality'],
  ['taste', 'taste'],
  ['flavour', 'taste'],
  ['flavor', 'taste'],
  ['pricing', 'affordability'],
  ['price', 'affordability'],
  ['value for money', 'affordability'],
  ['value', 'affordability'],
  ['affordability', 'affordability'],
  ['ambience', 'ambience'],
  ['ambiance', 'ambience'],
  ['atmosphere', 'ambience'],
  ['environment', 'ambience'],
  ['cleanliness', 'cleanliness'],
  ['hygiene', 'cleanliness'],
  ['sanitization', 'cleanliness'],
  ['tidiness', 'cleanliness'],
  ['location', 'location'],
  ['parking convenience', 'location'],
  ['accessibility', 'location'],
  ['convenience', 'location'],
  ['waiting time', 'service'],
  ['waiting', 'service'],
  ['professionalism', 'service'],
  ['appointment experience', 'service'],
  ['doctor communication', 'service'],
  ['communication', 'service'],
  ['haircut quality', 'service'],
  ['treatment quality', 'service'],
  ['product quality', 'service'],
  ['facility', 'service'],
  ['courtesy', 'staff'],
  ['reception', 'staff'],
  ['check-in process', 'service'],
  ['response time', 'service'],
  ['problem resolution', 'service'],
  ['scheduling', 'service'],
  ['aftercare', 'service']
]);

const canonicalizeCategory = (value = '') => {
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) return '';

  if (categoryAliases.has(normalized)) {
    return categoryAliases.get(normalized);
  }

  return normalized.replace(/\s+/g, '').replace(/[^a-z]/g, '') || '';
};

const reviewTagMetadata = {
  restaurant: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    foodquality: { name: 'Food quality' },
    taste: { name: 'Taste' },
    ambience: { name: 'Ambience' },
    cleanliness: { name: 'Cleanliness' },
    service: { name: 'Service quality' },
    affordability: { name: 'Pricing' },
    location: { name: 'Location' },
    hygiene: { name: 'Hygiene' },
    freshness: { name: 'Freshness' },
    comfort: { name: 'Comfort' }
  },
  salon: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    service: { name: 'Service quality' },
    ambience: { name: 'Ambience' },
    cleanliness: { name: 'Cleanliness' },
    affordability: { name: 'Pricing' },
    professionalism: { name: 'Professionalism' },
    styling: { name: 'Haircut quality' },
    aftercare: { name: 'Aftercare' },
    comfort: { name: 'Comfort' },
    timing: { name: 'Timing' },
    consultation: { name: 'Consultation quality' }
  },
  clinic: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    service: { name: 'Service quality' },
    cleanliness: { name: 'Cleanliness' },
    professionalism: { name: 'Doctor communication' },
    appointment: { name: 'Appointment experience' },
    facility: { name: 'Facility' },
    treatment: { name: 'Treatment quality' },
    communication: { name: 'Communication clarity' },
    comfort: { name: 'Comfort' },
    waiting: { name: 'Waiting time' },
    accessibility: { name: 'Accessibility' }
  }
};

export function getDefaultReviewCategories(category = 'restaurant') {
  const resolvedCategory = resolveCategory(category);
  const families = reviewTagMetadata[resolvedCategory] || reviewTagMetadata.restaurant;

  return Object.entries(families).map(([key, value]) => ({
    key,
    name: value.name,
    enabled: true
  }));
}

const uniqueText = (items) => {
  const result = [];
  const seen = new Set();

  for (const item of items) {
    const normalized = String(item).trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item);
  }

  return result;
};

export function buildReviewGenerationPrompt({
  businessName = 'this business',
  businessCategory = 'restaurant',
  selectedCategories = [],
  description = '',
  tone = 'natural',
  language = 'Hinglish',
  businessLocation = ''
}) {
  const tagsText = selectedCategories.length
    ? uniqueText(selectedCategories.map((item) => String(item).trim()).filter(Boolean)).join(', ')
    : 'general positive experience';

  const locationText = String(businessLocation || '').trim();
  const noteText = String(description || '').trim();

  return [
    'Generate a 100% unique, natural customer review for Google Maps using the details below:',
    `Business: ${businessName}`,
    `Category: ${businessCategory}`,
    locationText ? `Location: ${locationText}` : '',
    `Customer experience tags: ${tagsText}`,
    `Tone: ${tone}`,
    `Language: ${language}`,
    noteText ? `Customer personal note: ${noteText}` : '',
    'CRITICAL RULES FOR MAXIMUM VARIETY & AUTHENTICITY:',
    '- LENGTH: Exactly 1 to 2 short sentences, maximum 3 (under 35-40 words total).',
    '- DIVERSITY & NO TEMPLATES: Never use generic repetitive openers like "Had a great experience", "I recently visited", "Visited this place", or "Great place to". Start directly with what was memorable or a fresh spontaneous thought.',
    '- VARY SENTENCE STRUCTURE: Sometimes start with the atmosphere, sometimes with the service, sometimes with a personal recommendation or casual impression.',
    '- NATURAL VOICE: Sound like a real person writing quickly from their phone on Google Maps.',
    '- SCRIPT & LANGUAGE: Write strictly in ' + language + (language.toLowerCase() === 'hinglish' ? ' using natural conversational Hinglish in Latin alphabet (casual Hindi + English mix).' : '.'),
    '- OUTPUT ONLY: Return only the review text. No quotes, no markdown, no greetings, no bullet points, no commentary.'
  ].filter(Boolean).join('\n');
}

/**
 * Local generation has been completely removed.
 * Calling this throws an error directing callers to generateReviewWithFallback.
 */
export function generateReview() {
  throw new Error('Local review generation has been removed. AI generation is now exclusively used via generateReviewWithFallback.');
}

export async function callGeminiReviewGenerator({
  apiKey = process.env.GEMINI_API_KEY || '',
  prompt = '',
  model = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  timeoutMs = 15000
}) {
  if (!apiKey) {
    throw new Error('Missing Gemini API key.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  console.info(`[Review Generator] Calling Gemini API (${model})...`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 120
        }
      }),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Gemini request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const rawContent = data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();

  const content = rawContent ? rawContent.replace(/^["'“”]+|["'“”]+$/g, '').trim() : '';

  if (!content) {
    throw new Error('Gemini returned no usable completion content.');
  }

  return content;
}

export async function callXaiReviewGenerator({
  apiKey = '',
  prompt = '',
  model = process.env.SENSENOVA_MODEL || process.env.LLM_MODEL || process.env.SENSONOVA_MODEL || process.env.GROQ_MODEL || 'sensenova-6.8-flash-lite',
  baseUrl = process.env.LLM_BASE_URL || process.env.SENSENOVA_BASE_URL || process.env.SENSONOVA_BASE_URL || process.env.GROQ_BASE_URL || 'https://token.sensenova.ai/v1',
  timeoutMs = 15000
}) {
  if (!apiKey) {
    throw new Error('Missing LLM API key.');
  }

  console.info(`[Review Generator] Calling SenseNova API (${model}) via ${baseUrl}...`);

  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
    timeout: timeoutMs,
    dangerouslyAllowBrowser: false
  });

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.0,
    top_p: 0.95,
    max_tokens: 120
  });

  const raw = response?.choices?.[0]?.message?.content;
  let content = '';
  if (typeof raw === 'string' && raw.trim()) {
    content = raw.trim();
  } else if (Array.isArray(raw)) {
    content = raw.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim();
  }

  content = content.replace(/^["'“”]+|["'“”]+$/g, '').trim();

  if (content) return content;

  throw new Error('LLM returned no usable completion content.');
}

export async function generateReviewWithFallback({
  businessCategory = 'restaurant',
  selectedCategories = [],
  description = '',
  tone = 'natural',
  language = 'Hinglish',
  businessName = 'this business',
  businessSummary = '',
  businessProfileJson = '',
  businessLocation = '',
  llmApiKey = '',
  geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  senseNovaApiKey = process.env.SENSENOVA_API_KEY || process.env.SENSONOVA_API_KEY || '',
  llmRequest = null
}) {
  const normalized = normalizeReviewInput({ businessName, businessCategory, selectedCategories, tone, language, description, businessLocation });
  const prompt = buildReviewGenerationPrompt({
    businessName: normalized.businessName,
    businessCategory: normalized.businessCategory,
    selectedCategories: normalized.selectedCategories,
    description: normalized.description,
    tone: normalized.tone,
    language: normalized.language,
    businessLocation: normalized.businessLocation
  });

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
  const senseNovaModel = process.env.SENSENOVA_MODEL || process.env.LLM_MODEL || 'sensenova-6.8-flash-lite';

  console.info('\n' + '='.repeat(60));
  console.info('[Review Generator] Review Generation Request:');
  console.info(`  • Business: ${normalized.businessName} (${normalized.businessCategory}${normalized.businessLocation ? `, ${normalized.businessLocation}` : ''})`);
  console.info(`  • Selected Tags: ${normalized.selectedCategories.join(', ') || 'None (General positive)'}`);
  console.info(`  • Tone: ${normalized.tone} | Language: ${normalized.language}`);
  console.info(`  • Personal Note: ${normalized.description || 'None'}`);
  console.info(`  • Primary Provider: Google Gemini (${geminiModel})`);
  console.info(`  • Fallback Provider: SenseNova (${senseNovaModel})`);
  console.info('='.repeat(60));

  if (typeof llmRequest === 'function') {
    const timeoutMs = 20000;
    const response = await Promise.race([
      llmRequest({
        model: senseNovaModel,
        apiKey: llmApiKey || geminiApiKey || senseNovaApiKey,
        prompt,
        baseUrl: process.env.LLM_BASE_URL || 'https://token.sensenova.ai/v1'
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timed out after 20 seconds')), timeoutMs))
    ]);
    const text = String(response || '').trim();
    if (text) {
      console.info(`[Review Generator] ✅ Review generated via custom LLM:\n"${text}"\n` + '='.repeat(60));
      return text;
    }
    throw new Error('LLM custom request returned empty text.');
  }

  const errors = [];

  // Primary: Gemini
  if (geminiApiKey) {
    try {
      console.info(`[Review Generator] 🚀 Calling primary provider: Google Gemini (${geminiModel})...`);
      const text = String(await callGeminiReviewGenerator({ apiKey: geminiApiKey, prompt, model: geminiModel })).trim();
      if (text) {
        console.info(`[Review Generator] ✅ Review successfully generated using Google Gemini (${geminiModel}):\n"${text}"\n` + '='.repeat(60));
        return text;
      }
    } catch (error) {
      console.warn(`[Review Generator] ⚠️ Gemini primary failed (${error?.message || error}). Falling back to SenseNova...`);
      errors.push(`Gemini: ${error?.message || error}`);
    }
  } else {
    console.warn('[Review Generator] ⚠️ No Gemini API key found. Falling back to SenseNova...');
    errors.push('Gemini: Missing API key');
  }

  // Secondary: SenseNova
  if (senseNovaApiKey) {
    try {
      console.info(`[Review Generator] 🚀 Calling fallback provider: SenseNova (${senseNovaModel})...`);
      const text = String(await callXaiReviewGenerator({
        apiKey: senseNovaApiKey,
        prompt,
        model: senseNovaModel,
        baseUrl: process.env.LLM_BASE_URL || process.env.SENSENOVA_BASE_URL || 'https://token.sensenova.ai/v1'
      })).trim();
      if (text) {
        console.info(`[Review Generator] ✅ Review successfully generated using SenseNova (${senseNovaModel}):\n"${text}"\n` + '='.repeat(60));
        return text;
      }
    } catch (error) {
      console.warn(`[Review Generator] ❌ SenseNova failed: ${error?.message || error}`);
      errors.push(`SenseNova: ${error?.message || error}`);
    }
  } else {
    errors.push('SenseNova: Missing API key');
  }

  // NO LOCAL GENERATION FALLBACK: Throw error if all AI providers fail
  console.error(`[Review Generator] ❌ All AI providers failed: ${errors.join('; ')}\n` + '='.repeat(60));
  throw new Error(`AI review generation failed: ${errors.join('; ')}`);
}

export function normalizeReviewInput(input = {}) {
  const businessName = toTitleCase(String(input.businessName || 'this business'));
  const businessCategory = resolveCategory(input.businessCategory || 'restaurant');
  const selectedCategories = Array.isArray(input.selectedCategories)
    ? uniqueText(
        input.selectedCategories
          .map((item) => canonicalizeCategory(item))
          .filter(Boolean)
      )
    : [];
  const tone = resolveTone(input.tone || 'natural');
  const language = resolveLanguage(input.language || 'Hinglish');
  const description = String(input.description || '').trim();
  const contactName = String(input.contactName || '').trim();
  const contactPhone = String(input.contactPhone || input.contactNumber || '').trim();
  const businessLocation = String(input.businessLocation || input.location || '').trim();

  return {
    businessName,
    businessCategory,
    selectedCategories,
    tone,
    language,
    description,
    contactName,
    contactPhone,
    businessLocation
  };
}
