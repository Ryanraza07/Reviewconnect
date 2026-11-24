import OpenAI from 'openai';

const languageMap = {
  english: 'english',
  hindi: 'hindi',
  hinglish: 'hinglish'
};

const categoryMap = {
  restaurant: 'restaurant',
  cafe: 'restaurant',
  bakery: 'restaurant',
  dining: 'restaurant',
  food: 'restaurant',
  salon: 'salon',
  spa: 'salon',
  beauty: 'salon',
  parlour: 'salon',
  barber: 'salon',
  clinic: 'clinic',
  hospital: 'clinic',
  dental: 'clinic',
  doctor: 'clinic',
  healthcare: 'clinic',
  general_store: 'general_store',
  supermarket: 'general_store',
  grocery: 'general_store',
  kirana: 'general_store',
  mart: 'general_store',
  retail: 'general_store',
  optical: 'optical',
  optical_shop: 'optical',
  eyewear: 'optical',
  optometry: 'optical',
  optician: 'optical',
  pharmacy: 'pharmacy',
  chemist: 'pharmacy',
  medical: 'pharmacy',
  druggist: 'pharmacy',
  electronics: 'electronics',
  mobile: 'electronics',
  gadgets: 'electronics',
  appliances: 'electronics',
  computer: 'electronics',
  fashion: 'fashion',
  clothing: 'fashion',
  boutique: 'fashion',
  apparel: 'fashion',
  garments: 'fashion',
  gym: 'gym',
  fitness: 'gym',
  workout: 'gym',
  yoga: 'gym',
  automobile: 'automobile',
  garage: 'automobile',
  car_service: 'automobile',
  bike_service: 'automobile',
  workshop: 'automobile',
  hotel: 'hotel',
  hospitality: 'hotel',
  resort: 'hotel',
  stay: 'hotel',
  lodging: 'hotel'
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
const resolveLanguage = (value = 'Hinglish') => {
  const normalized = String(value || '').toLowerCase().trim();
  if (normalized === 'random' || normalized === 'auto') {
    const list = ['english', 'hinglish'];
    return list[Math.floor(Math.random() * list.length)];
  }
  return languageMap[normalized] || 'hinglish';
};
export const availableTones = ['natural', 'friendly', 'professional', 'simple'];
export const getRandomTone = () => availableTones[Math.floor(Math.random() * availableTones.length)];

const resolveTone = (value = 'random') => {
  const normalized = String(value || '').toLowerCase().trim();
  if (!normalized || normalized === 'random' || normalized === 'auto') {
    return getRandomTone();
  }
  return toneMap[normalized] || getRandomTone();
};

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
  ['aftercare', 'service'],
  ['variety', 'variety'],
  ['product variety', 'variety'],
  ['stock', 'variety'],
  ['eyetest', 'eyetest'],
  ['eye test', 'eyetest'],
  ['eye checkup', 'eyetest'],
  ['frames', 'frames'],
  ['frame collection', 'frames'],
  ['lenses', 'lenses'],
  ['lens quality', 'lenses'],
  ['billing', 'billing'],
  ['checkout', 'billing'],
  ['quick billing', 'billing'],
  ['delivery', 'delivery'],
  ['on-time delivery', 'delivery'],
  ['fitting', 'fitting'],
  ['frame fitting', 'fitting'],
  ['warranty', 'warranty'],
  ['aftersales', 'warranty'],
  ['availability', 'availability'],
  ['medicine availability', 'availability'],
  ['genuineness', 'genuineness'],
  ['genuine products', 'genuineness'],
  ['product range', 'product_range'],
  ['demo', 'demo'],
  ['product demo', 'demo'],
  ['collection', 'collection'],
  ['latest collection', 'collection'],
  ['fabric', 'fabric'],
  ['stitching', 'fabric'],
  ['alteration', 'alteration'],
  ['equipment', 'equipment'],
  ['gym equipment', 'equipment'],
  ['trainers', 'trainers'],
  ['trainer guidance', 'trainers'],
  ['workout floor', 'space'],
  ['mechanic', 'expertise'],
  ['turnaround', 'turnaround'],
  ['transparency', 'transparency'],
  ['genuine parts', 'genuine_parts'],
  ['spare parts', 'genuine_parts'],
  ['diagnostics', 'diagnostics'],
  ['rooms', 'rooms'],
  ['room cleanliness', 'rooms'],
  ['bedding', 'bedding'],
  ['bathroom', 'bathroom'],
  ['checkin', 'checkin']
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
  },
  general_store: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    variety: { name: 'Product variety & stock' },
    affordability: { name: 'Pricing & value' },
    billing: { name: 'Billing speed & checkout' },
    freshness: { name: 'Freshness of items' },
    cleanliness: { name: 'Store cleanliness' },
    service: { name: 'Customer assistance' },
    location: { name: 'Location & accessibility' },
    discounts: { name: 'Offers & discounts' },
    organization: { name: 'Ease of finding items' },
    digitalpayment: { name: 'Payment convenience' }
  },
  optical: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    eyetest: { name: 'Eye testing accuracy' },
    frames: { name: 'Frame collection & variety' },
    lenses: { name: 'Lens quality & clarity' },
    affordability: { name: 'Pricing & value' },
    delivery: { name: 'On-time delivery' },
    fitting: { name: 'Frame fitting & comfort' },
    cleanliness: { name: 'Store cleanliness' },
    service: { name: 'Customer service' },
    consultation: { name: 'Optometrist guidance' },
    warranty: { name: 'After-sales & warranty' }
  },
  pharmacy: {
    staff: { name: 'Pharmacist behaviour' },
    overall: { name: 'Overall experience' },
    availability: { name: 'Medicine availability' },
    billing: { name: 'Quick billing & packing' },
    affordability: { name: 'Genuine rates & discounts' },
    cleanliness: { name: 'Store hygiene & storage' },
    guidance: { name: 'Prescription guidance' },
    delivery: { name: 'Home delivery service' },
    digitalpayment: { name: 'Payment options' },
    location: { name: 'Location convenience' },
    genuineness: { name: 'Genuine medicines' },
    emergency: { name: 'Prompt assistance' }
  },
  electronics: {
    staff: { name: 'Staff behaviour' },
    overall: { name: 'Overall experience' },
    product_range: { name: 'Gadget variety & stock' },
    genuineness: { name: '100% genuine products' },
    affordability: { name: 'Best pricing & deals' },
    demo: { name: 'Product demo & guidance' },
    service: { name: 'Customer service' },
    billing: { name: 'Quick billing & invoice' },
    warranty: { name: 'Warranty & guarantee' },
    payment: { name: 'EMI & payment options' },
    ambience: { name: 'Store display & ambience' },
    aftersales: { name: 'After-sales support' }
  },
  fashion: {
    staff: { name: 'Staff assistance' },
    overall: { name: 'Overall experience' },
    collection: { name: 'Latest design collection' },
    fabric: { name: 'Fabric & stitching quality' },
    fitting: { name: 'Trial room & fitting' },
    affordability: { name: 'Reasonable pricing' },
    variety: { name: 'Color & size variety' },
    ambience: { name: 'Showroom ambience' },
    billing: { name: 'Smooth billing' },
    alteration: { name: 'Alteration service' },
    discounts: { name: 'Seasonal discounts' },
    cleanliness: { name: 'Store neatness' }
  },
  gym: {
    staff: { name: 'Staff & trainer behaviour' },
    overall: { name: 'Overall experience' },
    equipment: { name: 'Modern workout machines' },
    cleanliness: { name: 'Hygiene & sanitization' },
    trainers: { name: 'Certified trainer guidance' },
    ambience: { name: 'Music & workout vibe' },
    affordability: { name: 'Membership pricing' },
    space: { name: 'Spacious workout floor' },
    ventilation: { name: 'AC & ventilation' },
    crowd: { name: 'Crowd management' },
    facilities: { name: 'Lockers & changing rooms' },
    timings: { name: 'Flexible operating hours' }
  },
  automobile: {
    staff: { name: 'Mechanic behaviour' },
    overall: { name: 'Overall experience' },
    expertise: { name: 'Mechanical expertise' },
    turnaround: { name: 'Turnaround time' },
    transparency: { name: 'Transparent cost estimate' },
    affordability: { name: 'Reasonable repair charges' },
    genuine_parts: { name: 'Genuine spare parts' },
    cleanliness: { name: 'Washing & cleanup' },
    service: { name: 'Service quality' },
    pickup_drop: { name: 'Pickup & drop facility' },
    diagnostics: { name: 'Accurate problem diagnosis' },
    updates: { name: 'Timely status updates' }
  },
  hotel: {
    staff: { name: 'Staff hospitality' },
    overall: { name: 'Overall stay experience' },
    rooms: { name: 'Room cleanliness & comfort' },
    bedding: { name: 'Bedding & linen quality' },
    bathroom: { name: 'Clean bathrooms & hot water' },
    checkin: { name: 'Fast check-in & check-out' },
    food: { name: 'Room service & breakfast' },
    location: { name: 'Location & accessibility' },
    affordability: { name: 'Value for money' },
    wifi: { name: 'High-speed Wi-Fi & AC' },
    parking: { name: 'Safe parking facility' },
    safety: { name: 'Security & peaceful stay' }
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

export function pickRandomLengthProfile(tone = 'natural', preferredLength = 'random') {
  if (preferredLength && preferredLength !== 'random') {
    switch (preferredLength) {
      case 'short':
      case 'small':
        return {
          type: 'short',
          instruction: '- LENGTH: VERY SHORT & PUNCHY (1 single crisp sentence or 2 brief phrases, strictly under 16 words / around 40-90 characters total). Sound like someone leaving a quick 5-second rating on Google Maps from their phone.'
        };
      case 'long':
      case 'big':
        return {
          type: 'long',
          instruction: '- LENGTH: DETAILED & THOROUGH (3 to 5 descriptive sentences, roughly 50-80 words / around 260-420 characters total). Share a vivid, complete review describing the visit in more depth (e.g. what stood out about the ambience, staff responsiveness, specific quality of experience, and a strong personal recommendation for other visitors).'
        };
      case 'medium':
      default:
        return {
          type: 'medium',
          instruction: '- LENGTH: MEDIUM & BALANCED (2 to 3 natural sentences, roughly 25-45 words / around 125-210 characters total). Highlight the main positive impressions with natural casual flow.'
        };
    }
  }

  // If tone is explicitly "Short" ('simple')
  if (tone === 'simple') {
    return Math.random() < 0.75
      ? {
          type: 'short',
          instruction: '- LENGTH: VERY SHORT & PUNCHY (1 crisp sentence or 2 brief phrases, strictly under 16 words / around 40-90 characters total). Keep it snappy and quick.'
        }
      : {
          type: 'medium',
          instruction: '- LENGTH: SHORT-TO-MEDIUM (2 short sentences, roughly 20-30 words / around 100-160 characters total).'
        };
  }

  // Pure random variation across SMALL, MEDIUM, and BIG (approx 33% each)
  const roll = Math.random();
  if (roll < 0.33) {
    // 1. SMALL (Short & punchy ~40-90 characters)
    return {
      type: 'short',
      instruction: '- LENGTH: VERY SHORT & PUNCHY (1 single crisp sentence or 2 brief punchy phrases, strictly between 8-16 words / around 40-90 characters total). Sound like someone leaving a quick 5-second rating on Google Maps from their phone.'
    };
  } else if (roll < 0.67) {
    // 2. MEDIUM (Standard balanced ~125-210 characters)
    return {
      type: 'medium',
      instruction: '- LENGTH: MEDIUM & BALANCED (2 to 3 natural sentences, roughly 25-45 words / around 125-210 characters total). Balance the experience highlights with a natural casual remark.'
    };
  } else {
    // 3. BIG (Detailed & thorough ~260-420 characters)
    return {
      type: 'long',
      instruction: '- LENGTH: DETAILED & THOROUGH (3 to 5 expressive sentences, roughly 50-80 words / around 260-420 characters total). Share a rich, descriptive review mentioning the visit in more depth (e.g. the ambience, staff attentiveness, specific quality of experience, and a strong personal recommendation for others).'
    };
  }
}

export const reviewerAngles = [
  'Understated and practical perspective: Focus on cleanliness, promptness, smooth handling, and fair pricing without hype.',
  'Sensory and observant perspective: Focus on tangible physical details like sounds, seating comfort, cleanliness, temperature, lighting, or aroma.',
  'Casual text-message style: Sounds completely unpolished and natural, like something texted to a friend or family member.',
  'Matter-of-fact direct verdict: Straightforward customer evaluation of speed, service quality, and overall execution without marketing buzzwords.',
  'First-time visitor perspective: Stopped by for the first time, pleasant impression regarding the quality and unhurried experience.',
  'Thoughtful and patient perspective: Appreciates attentive care, respectful communication, hygiene, and care taken with customer requests.',
  'Quick mobile reviewer perspective: Crisp, direct feedback typed right after the visit from a phone.'
];

export const pickRandomReviewerAngle = () =>
  reviewerAngles[Math.floor(Math.random() * reviewerAngles.length)];

const FORBIDDEN_CLICHES = [
  'In English: "go-to spot/place/salon", "hidden gem", "top-notch", "highly recommend", "highly recommended", "must visit", "must-visit", "super friendly", "hassle-free", "worth every penny", "from the moment I stepped/walked in", "look no further", "exceeded my expectations", "10/10", "game changer".',
  'In Hinglish: "ekdum mast", "ekdum top-notch", "top notch", "highly recommend", "highly recommended", "kaafi polite", "totally worth it", "dil jeet liya", "ab se regular yahi aunga", "bilkul miss mat karna", "bohot hi pyaara vibe", "meri toh jaan nikli jaa rahi thi", "truly best", "ek number".'
];

const getFreshVocabularyHints = (language = 'hinglish', category = 'restaurant') => {
  const cat = String(category || '').toLowerCase();
  const isEnglish = String(language || '').toLowerCase() === 'english';

  const categoryHints = {
    optical: {
      en: 'Draw from optical-specific words like accurate eye test, comfortable frame fitting, clear vision lenses, patient optometry consultation, prompt delivery, neat display.',
      hi: 'Draw from optical words like accurate eye testing, frames ka badhiya collection, time par delivery, lightweight aur comfortable fitting, tasalli se checkup.'
    },
    general_store: {
      en: 'Draw from retail words like well-stocked inventory, fresh packaged goods, speedy checkout, organized aisles, fair pricing, convenient shopping.',
      hi: 'Draw from store words like fresh grocery stock, fast billing counter, saara daily samaan ek jagah, sahi rate, neat aisles, bina bheed ke aaram se shopping.'
    },
    pharmacy: {
      en: 'Draw from pharmacy words like properly stored medicines, prompt dispensing, verified prescriptions, polite pharmacist, transparent billing.',
      hi: 'Draw from medical words like saari medicines turant mil gayi, genuine bill, chemist ne dosage sahi se samjhaya, safe storage.'
    },
    electronics: {
      en: 'Draw from electronics words like genuine product warranty, clear product demo, competitive pricing, knowledgeable staff, smooth purchase setup.',
      hi: 'Draw from gadget words like genuine sealed product, best price deal, demo acche se samjhaya, billing aur warranty jaldi ban gayi.'
    },
    fashion: {
      en: 'Draw from fashion words like trendy design collection, comfortable fabric, clean trial rooms, reasonable pricing, helpful styling assistance.',
      hi: 'Draw from boutique words like latest kapdo ka collection, cloth quality badhiya hai, trial room neat tha, smooth billing aur fitting.'
    },
    gym: {
      en: 'Draw from fitness words like well-maintained weights, clean machines, motivating atmosphere, knowledgeable trainers, spacious floor, good ventilation.',
      hi: 'Draw from gym words like machines well-maintained hain, trainers supportive hain, proper ventilation aur safe workout environment.'
    },
    automobile: {
      en: 'Draw from automotive words like honest cost estimate, resolved the mechanical issue promptly, clean handover, transparent repair billing.',
      hi: 'Draw from garage words like bina kisi extra charge ke sahi kaam kiya, mechanic ne issue ache se explain kiya, timely delivery di.'
    },
    hotel: {
      en: 'Draw from hospitality words like spotless linen, quiet room, warm front desk, prompt room service, comfortable sleep, safe parking.',
      hi: 'Draw from hotel words like room bilkul neat aur clean tha, AC aur hot water proper chal raha tha, peaceful stay, courteous front desk.'
    }
  };

  const specific = categoryHints[cat];
  if (specific) {
    return isEnglish ? `USE VARIED, NATURAL VOCABULARY: ${specific.en}` : `USE VARIED, NATURAL VOCABULARY: ${specific.hi}`;
  }

  if (isEnglish) {
    return 'USE VARIED, NATURAL VOCABULARY: Draw from diverse words like crisp, unhurried, patient, attentive, seamless, well-managed, spotless, balanced, straightforward, cozy, pleasant, prompt, considerate, reasonable, calm, neatly maintained.';
  }
  return 'USE VARIED, NATURAL VOCABULARY: Draw from diverse spoken words like shandar, badhiya, tasalli se, peaceful, bina kisi hurry ke, clean and neat, pocket-friendly, smooth, sahi kaam, safe, comfortable, accha laga, bina lambe wait ke.';
};

export function buildReviewGenerationPrompt({
  businessName = 'this business',
  businessCategory = 'restaurant',
  selectedCategories = [],
  description = '',
  tone = 'natural',
  language = 'Hinglish',
  businessLocation = '',
  lengthProfile = null,
  reviewerAngle = null
}) {
  const tagsText = selectedCategories.length
    ? uniqueText(selectedCategories.map((item) => String(item).trim()).filter(Boolean)).join(', ')
    : 'general positive experience';

  const locationText = String(businessLocation || '').trim();
  const noteText = String(description || '').trim();
  const profile = (lengthProfile && lengthProfile.instruction)
    ? lengthProfile
    : pickRandomLengthProfile(tone, typeof lengthProfile === 'string' ? lengthProfile : 'random');

  const angleInstruction = reviewerAngle || pickRandomReviewerAngle();
  const vocabHints = getFreshVocabularyHints(language, businessCategory);
  const randomContextNonce = Math.floor(Math.random() * 1000000);

  return [
    'Generate a 100% unique, natural customer review for Google Maps using the details below:',
    `Business: ${businessName}`,
    `Category: ${businessCategory}`,
    locationText ? `Location: ${locationText}` : '',
    `Customer experience tags: ${tagsText}`,
    `Tone: ${tone}`,
    `Language: ${language}`,
    noteText ? `Customer personal note: ${noteText}` : '',
    `Reviewer Perspective: ${angleInstruction}`,
    `Context Reference: #${randomContextNonce}`,
    'CRITICAL RULES FOR MAXIMUM VARIETY & AUTHENTICITY:',
    profile.instruction,
    '- ABSOLUTELY FORBIDDEN CLICHÉS (DO NOT USE ANY OF THESE WORDS/PHRASES):',
    ...FORBIDDEN_CLICHES.map((rule) => `  ${rule}`),
    '- NO CLICHÉ SIGN-OFFS: Never end with predictable marketing formulas like "Highly recommend", "Must visit", "Definitely my new go-to", "Totally worth it", "10/10", or "Ab se regular yahi aunga". End naturally on a concrete observation, or simply stop after stating the facts.',
    `- ${vocabHints}`,
    '- DIVERSITY & NO TEMPLATES: Never use generic repetitive openers like "Had a great experience", "I recently visited", "Visited this place", or "Great place to". Start directly with what was memorable or a fresh spontaneous thought.',
    '- VARY SENTENCE STRUCTURE: Sometimes start with the atmosphere, sometimes with the service, sometimes with a personal recommendation or casual impression.',
    '- NATURAL VOICE: Sound like a real person writing quickly from their phone on Google Maps.',
    '- SCRIPT & LANGUAGE: Write strictly in ' + language + (language.toLowerCase() === 'hinglish' ? ' using natural conversational Hinglish in Latin alphabet (casual Hindi + English mix).' : (language.toLowerCase() === 'hindi' ? ' (हिंदी लिपि में) using natural everyday conversational Hindi.' : ' using natural, authentic English.')),
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
          temperature: 1.1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 280
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
    temperature: 1.1,
    top_p: 0.95,
    presence_penalty: 0.6,
    frequency_penalty: 0.5,
    max_tokens: 280
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
  lengthProfile = 'random',
  length = '',
  llmApiKey = '',
  geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  senseNovaApiKey = process.env.SENSENOVA_API_KEY || process.env.SENSONOVA_API_KEY || '',
  llmRequest = null
}) {
  const normalized = normalizeReviewInput({ businessName, businessCategory, selectedCategories, tone, language, description, businessLocation });
  const selectedProfile = pickRandomLengthProfile(normalized.tone, length || lengthProfile || 'random');
  const prompt = buildReviewGenerationPrompt({
    businessName: normalized.businessName,
    businessCategory: normalized.businessCategory,
    selectedCategories: normalized.selectedCategories,
    description: normalized.description,
    tone: normalized.tone,
    language: normalized.language,
    businessLocation: normalized.businessLocation,
    lengthProfile: selectedProfile
  });

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
  const senseNovaModel = process.env.SENSENOVA_MODEL || process.env.LLM_MODEL || 'sensenova-6.8-flash-lite';

  console.info('\n' + '='.repeat(60));
  console.info('[Review Generator] Review Generation Request:');
  console.info(`  • Business: ${normalized.businessName} (${normalized.businessCategory}${normalized.businessLocation ? `, ${normalized.businessLocation}` : ''})`);
  console.info(`  • Selected Tags: ${normalized.selectedCategories.join(', ') || 'None (General positive)'}`);
  console.info(`  • Tone: ${normalized.tone} | Language: ${normalized.language}`);
  console.info(`  • Target Length Profile: ${selectedProfile.type.toUpperCase()}`);
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
