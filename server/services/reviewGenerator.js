import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/reviewTemplates');

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

const phraseCatalog = {
  staff: {
    english: ['The staff were warm and helpful.', 'The team felt polite and attentive.', 'The staff provided friendly and responsive service.', 'The team was welcoming and thoughtful.', 'The staff handled everything with care.', 'The team made the visit feel personal.', 'The front desk was warm and reassuring.', 'The staff were professional and approachable.', 'The team was patient and easy to work with.', 'The service felt genuinely caring.', 'The staff made the experience smooth and comfortable.', 'The staff were courteous throughout.'],
    hindi: ['Staff warm aur helpful the.', 'Team polite aur attentive thi.', 'Staff ne friendly aur responsive service diya.', 'Team welcoming aur thoughtful tha.', 'Staff ne sabko calm aur care ke sath handle kiya.', 'Team ne experience personal feel karaya.', 'Front desk warm aur reassuring tha.', 'Staff professional aur approachable the.', 'Team patient aur easy to work with thi.', 'Service genuinely caring laga.', 'Staff ne experience smooth aur comfortable bana diya.', 'Staff courteous the throughout.'],
    hinglish: ['Staff warm aur helpful the.', 'Team polite aur attentive thi.', 'Staff ne friendly aur responsive service diya.', 'Team welcoming aur thoughtful tha.', 'Staff ne sabko calm aur care ke sath handle kiya.', 'Team ne experience personal feel karaya.', 'Front desk warm aur reassuring tha.', 'Staff professional aur approachable the.', 'Team patient aur easy to work with thi.', 'Service genuinely caring laga.', 'Staff ne experience smooth aur comfortable bana diya.', 'Staff courteous the throughout.']
  },
  overall: {
    english: ['The overall experience felt balanced and worth it.', 'My overall impression was positive and encouraging.', 'The experience was smooth from start to finish.', 'The overall vibe felt reassuring and comfortable.', 'Everything felt practical and well managed.', 'Overall it was a satisfying and fair experience.', 'The full experience felt polished and dependable.', 'The visit worked out smoothly for me.', 'Overall, it felt memorable for the right reasons.', 'The experience was more than acceptable and consistent.', 'Overall, the visit felt easy and stress-free.', 'The total experience left a good impression.'],
    hindi: ['Overall experience balanced aur worth it laga.', 'Mera overall impression positive aur encouraging tha.', 'Experience start se end tak smooth raha.', 'Overall vibe reassuring aur comfortable laga.', 'Sab kuch practical aur well managed laga.', 'Overall, experience satisfying aur fair raha.', 'Full experience polished aur dependable laga.', 'Visit smooth aur easy raha.', 'Overall, visit meaningful aur positive raha.', 'Experience acceptable aur consistent tha.', 'Overall, visit easy aur stress-free laga.', 'Total experience ne good impression diya.'],
    hinglish: ['Overall experience balanced aur worth it laga.', 'Mera overall impression positive aur encouraging tha.', 'Experience start se end tak smooth raha.', 'Overall vibe reassuring aur comfortable laga.', 'Sab kuch practical aur well managed laga.', 'Overall, experience satisfying aur fair raha.', 'Full experience polished aur dependable laga.', 'Visit smooth aur easy raha.', 'Overall, visit meaningful aur positive raha.', 'Experience acceptable aur consistent tha.', 'Overall, visit easy aur stress-free laga.', 'Total experience ne good impression diya.']
  },
  foodquality: {
    english: ['The food quality was fresh and satisfying.', 'The dishes felt well prepared and consistent.', 'The quality of the food was strong and dependable.', 'The meal was cooked with attention and care.', 'The food looked appetizing and tasted fresh.', 'The preparation felt neatly done and thoughtful.', 'The ingredients felt premium and well chosen.', 'The menu had a reliable standard of quality.', 'The dishes had a nice balance and taste.', 'Food quality was solid and pleasing.', 'Everything served felt fresh and balanced.', 'The meals were consistent and genuinely enjoyable.'],
    hindi: ['Food quality fresh aur satisfying tha.', 'Dishes well prepared aur consistent lag rahi thi.', 'Food quality strong aur dependable thi.', 'Meal ne attention aur care ke sath bana tha.', 'Food appetizing laga aur fresh taste aaya.', 'Preparation neat aur thoughtful tha.', 'Ingredients premium aur well chosen lag rahe the.', 'Menu mein quality ka reliable standard tha.', 'Dishes mein nice balance aur taste tha.', 'Food quality solid aur pleasant tha.', 'Sab kuch fresh aur balanced laga.', 'Meals consistent aur genuinely enjoyable the.'],
    hinglish: ['Food quality fresh aur satisfying tha.', 'Dishes well prepared aur consistent lag rahi thi.', 'Food quality strong aur dependable thi.', 'Meal ne attention aur care ke sath bana tha.', 'Food appetizing laga aur fresh taste aaya.', 'Preparation neat aur thoughtful tha.', 'Ingredients premium aur well chosen lag rahe the.', 'Menu mein quality ka reliable standard tha.', 'Dishes mein nice balance aur taste tha.', 'Food quality solid aur pleasant tha.', 'Sab kuch fresh aur balanced laga.', 'Meals consistent aur genuinely enjoyable the.']
  },
  taste: {
    english: ['The taste was enjoyable and balanced.', 'The flavour felt rich but not overwhelming.', 'Everything tasted fresh and satisfying.', 'Taste was consistent and pleasing.', 'The seasoning was on point.', 'The flavours were authentic and appealing.', 'The food had a good depth of taste.', 'The taste felt comforting and enjoyable.', 'The menu had a clean, balanced flavour profile.', 'The taste matched expectations really well.', 'It felt properly seasoned and full of character.', 'The food had a nice, memorable flavour.'],
    hindi: ['Taste enjoyable aur balanced tha.', 'Flavour rich tha but overwhelming nahi tha.', 'Sab kuch fresh aur satisfying taste kar raha tha.', 'Taste consistent aur pleasing tha.', 'Seasoning on point tha.', 'Flavours authentic aur appealing the.', 'Food mein taste ki good depth thi.', 'Taste comforting aur enjoyable laga.', 'Menu mein clean aur balanced flavour profile tha.', 'Taste expectations ke according tha.', 'Properly seasoned aur character-full laga.', 'Food ka flavour nice aur memorable tha.'],
    hinglish: ['Taste enjoyable aur balanced tha.', 'Flavour rich tha but overwhelming nahi tha.', 'Sab kuch fresh aur satisfying taste kar raha tha.', 'Taste consistent aur pleasing tha.', 'Seasoning on point tha.', 'Flavours authentic aur appealing the.', 'Food mein taste ki good depth thi.', 'Taste comforting aur enjoyable laga.', 'Menu mein clean aur balanced flavour profile tha.', 'Taste expectations ke according tha.', 'Properly seasoned aur character-full laga.', 'Food ka flavour nice aur memorable tha.']
  },
  ambience: {
    english: ['The ambience felt warm and welcoming.', 'The atmosphere was relaxed and comfortable.', 'The interior felt stylish and inviting.', 'The place had a pleasant mood throughout.', 'The decor was appealing and easy to enjoy.', 'It felt calm, modern, and comfortable.', 'The environment was polished and inviting.', 'The setting gave a pleasant overall vibe.', 'The space felt easy and relaxed to be in.', 'The ambience matched the mood really well.', 'The room felt vibrant but still calm.', 'The atmosphere made the visit feel easy.'],
    hindi: ['Ambience warm aur welcoming tha.', 'Atmosphere relaxed aur comfortable tha.', 'Interior stylish aur inviting laga.', 'Place ka mood pleasant tha throughout.', 'Decor appealing aur easy to enjoy tha.', 'It felt calm, modern, and comfortable.', 'Environment polished aur inviting tha.', 'Setting ne nice overall vibe diya.', 'Space easy aur relaxed feel hua.', 'Ambience mood ke according tha.', 'Room vibrant but calm feel hua.', 'Atmosphere ne visit ko easy bana diya.'],
    hinglish: ['Ambience warm aur welcoming tha.', 'Atmosphere relaxed aur comfortable tha.', 'Interior stylish aur inviting laga.', 'Place ka mood pleasant tha throughout.', 'Decor appealing aur easy to enjoy tha.', 'It felt calm, modern, and comfortable.', 'Environment polished aur inviting tha.', 'Setting ne nice overall vibe diya.', 'Space easy aur relaxed feel hua.', 'Ambience mood ke according tha.', 'Room vibrant but calm feel hua.', 'Atmosphere ne visit ko easy bana diya.']
  },
  cleanliness: {
    english: ['The place was clean and well maintained.', 'The cleanliness standards were reassuring.', 'Everything felt neat, tidy, and well cared for.', 'It was obvious the space was looked after.', 'The hygiene standards felt strong and consistent.', 'The interior and surfaces looked well kept.', 'The spot felt tidy and fresh throughout.', 'Maintenance was clearly visible and effective.', 'The environment felt sanitary and organised.', 'The care and upkeep were visible everywhere.', 'The place felt fresh and properly maintained.', 'Cleanliness was a major positive.'],
    hindi: ['Place clean aur well maintained tha.', 'Cleanliness standards reassuring the.', 'Sab kuch neat, tidy aur well cared for lag raha tha.', 'Space ko properly look after kiya gaya tha.', 'Hygiene standards strong aur consistent the.', 'Interior aur surfaces well kept lag rahe the.', 'Spot tidy aur fresh feel hua throughout.', 'Maintenance clearly visible aur effective tha.', 'Environment sanitary aur organised lag raha tha.', 'Care aur upkeep everywhere visible thi.', 'Place fresh aur properly maintained laga.', 'Cleanliness ek major positive tha.'],
    hinglish: ['Place clean aur well maintained tha.', 'Cleanliness standards reassuring the.', 'Sab kuch neat, tidy aur well cared for lag raha tha.', 'Space ko properly look after kiya gaya tha.', 'Hygiene standards strong aur consistent the.', 'Interior aur surfaces well kept lag rahe the.', 'Spot tidy aur fresh feel hua throughout.', 'Maintenance clearly visible aur effective tha.', 'Environment sanitary aur organised lag raha tha.', 'Care aur upkeep everywhere visible thi.', 'Place fresh aur properly maintained laga.', 'Cleanliness ek major positive tha.']
  },
  service: {
    english: ['The service was smooth and efficient.', 'Response time was quick and helpful.', 'The process felt easy and well managed.', 'Everything was handled promptly and professionally.', 'Service quality was solid throughout.', 'The team was responsive and attentive.', 'The experience felt organised from the moment I arrived.', 'Service speed was good and on time.', 'The process was easy and stress-free.', 'The handling was efficient and thoughtful.', 'The team kept things moving nicely.', 'The service felt reliable and easy to trust.'],
    hindi: ['Service smooth aur efficient tha.', 'Response time quick aur helpful tha.', 'Process easy aur well managed laga.', 'Sab kuch promptly aur professionally handle hua.', 'Service quality throughout solid thi.', 'Team responsive aur attentive thi.', 'Experience organised laga start se end tak.', 'Service speed good aur on time thi.', 'Process easy aur stress-free tha.', 'Handling efficient aur thoughtful tha.', 'Team ne things ko smoothly move rakha.', 'Service reliable aur easy to trust laga.'],
    hinglish: ['Service smooth aur efficient tha.', 'Response time quick aur helpful tha.', 'Process easy aur well managed laga.', 'Sab kuch promptly aur professionally handle hua.', 'Service quality throughout solid thi.', 'Team responsive aur attentive thi.', 'Experience organised laga start se end tak.', 'Service speed good aur on time thi.', 'Process easy aur stress-free tha.', 'Handling efficient aur thoughtful tha.', 'Team ne things ko smoothly move rakha.', 'Service reliable aur easy to trust laga.']
  },
  affordability: {
    english: ['The pricing felt fair and reasonable.', 'The value for money was good.', 'The cost matched the experience well.', 'The pricing made sense for what I received.', 'The charges felt balanced and acceptable.', 'The value was strong for the price.', 'I felt the pricing was reasonable and honest.', 'The offers and pricing were fair.', 'The cost felt justified by the quality.', 'The pricing was transparent and fair.', 'I felt the value matched the spend.', 'The money felt worth it.'],
    hindi: ['Pricing fair aur reasonable thi.', 'Value for money good tha.', 'Cost experience ke hisaab se sahi laga.', 'Charges balanced aur acceptable the.', 'Value price ke hisaab se strong tha.', 'Main feel kiya pricing reasonable aur honest thi.', 'Offers aur pricing fair the.', 'Cost quality ke hisaab se justified laga.', 'Pricing transparent aur fair thi.', 'Value spend ke hisaab se match karta tha.', 'Money worth it feel hua.', 'Price aur quality ka balance good tha.'],
    hinglish: ['Pricing fair aur reasonable thi.', 'Value for money good tha.', 'Cost experience ke hisaab se sahi laga.', 'Charges balanced aur acceptable the.', 'Value price ke hisaab se strong tha.', 'Main feel kiya pricing reasonable aur honest thi.', 'Offers aur pricing fair the.', 'Cost quality ke hisaab se justified laga.', 'Pricing transparent aur fair thi.', 'Value spend ke hisaab se match karta tha.', 'Money worth it feel hua.', 'Price aur quality ka balance good tha.']
  },
  location: {
    english: ['The location was easy to find and access.', 'The place was convenient to reach.', 'Parking and access felt easy and practical.', 'The location made the visit really convenient.', 'The setting was easy to reach without hassle.', 'Accessibility was comfortable and straightforward.', 'The place was well placed for a quick visit.', 'The location was central and convenient.', 'It was easy to access and navigate.', 'The spot was practical to reach.', 'The reachability was smooth and easy.', 'The convenience factor was a big plus.'],
    hindi: ['Location easy to find aur access karna tha.', 'Place reach karna convenient tha.', 'Parking aur access easy aur practical laga.', 'Location ne visit ko really convenient bana diya.', 'Setting reach karna hassle-free tha.', 'Accessibility comfortable aur straightforward thi.', 'Place quick visit ke liye well placed tha.', 'Location central aur convenient tha.', 'Access aur navigation easy tha.', 'Spot reach karna practical tha.', 'Reachability smooth aur easy thi.', 'Convenience factor ek big plus tha.'],
    hinglish: ['Location easy to find aur access karna tha.', 'Place reach karna convenient tha.', 'Parking aur access easy aur practical laga.', 'Location ne visit ko really convenient bana diya.', 'Setting reach karna hassle-free tha.', 'Accessibility comfortable aur straightforward thi.', 'Place quick visit ke liye well placed tha.', 'Location central aur convenient tha.', 'Access aur navigation easy tha.', 'Spot reach karna practical tha.', 'Reachability smooth aur easy thi.', 'Convenience factor ek big plus tha.']
  },
  hygiene: {
    english: ['The hygiene standards felt reassuring.', 'Everything felt safe and neatly maintained.', 'Sanitation was clearly considered and consistent.', 'The place felt fresh in a very reassuring way.', 'The cleanliness and hygiene quality was strong.', 'The upkeep made the whole visit feel safer.', 'The environment felt sanitary and professional.', 'I felt comfortable because hygiene was well managed.', 'The standard of care felt high and consistent.', 'The place looked carefully maintained and safe.', 'The hygiene attention was noticeable and appreciated.', 'The standard felt polished and dependable.'],
    hindi: ['Hygiene standards reassuring the.', 'Sab kuch safe aur neatly maintained laga.', 'Sanitation clearly considered aur consistent tha.', 'Place fresh aur reassuring feel kar raha tha.', 'Cleanliness aur hygiene quality strong thi.', 'Upkeep ne whole visit ko safe feel karaya.', 'Environment sanitary aur professional laga.', 'Main comfortable feel kiya kyunki hygiene well managed thi.', 'Care standard high aur consistent tha.', 'Place carefully maintained aur safe lag raha tha.', 'Hygiene attention noticeable aur appreciated tha.', 'Standard polished aur dependable laga.'],
    hinglish: ['Hygiene standards reassuring the.', 'Sab kuch safe aur neatly maintained laga.', 'Sanitation clearly considered aur consistent tha.', 'Place fresh aur reassuring feel kar raha tha.', 'Cleanliness aur hygiene quality strong thi.', 'Upkeep ne whole visit ko safe feel karaya.', 'Environment sanitary aur professional laga.', 'Main comfortable feel kiya kyunki hygiene well managed thi.', 'Care standard high aur consistent tha.', 'Place carefully maintained aur safe lag raha tha.', 'Hygiene attention noticeable aur appreciated tha.', 'Standard polished aur dependable laga.']
  },
  freshness: {
    english: ['Everything felt fresh and current.', 'The freshness of the experience stood out.', 'The feel of the place was lively and clean.', 'The freshness made the visit more enjoyable.', 'Things felt crisp, new, and well cared for.', 'The overall freshness added to the experience.', 'Everything looked clean and updated.', 'The atmosphere felt lively without being noisy.', 'The freshness was a clear plus for me.', 'The place felt renewed and well looked after.', 'The fresh feel made the whole visit better.', 'The experience felt lively and current.'],
    hindi: ['Sab kuch fresh aur current laga.', 'Experience ki freshness standout thi.', 'Place ka feel lively aur clean tha.', 'Freshness ne visit ko aur enjoyable bana diya.', 'Things crisp, new aur well cared for lag rahi thi.', 'Overall freshness ne experience ko improve kiya.', 'Sab kuch clean aur updated laga.', 'Atmosphere lively thi without being noisy.', 'Freshness ek clear plus thi.', 'Place renewed aur well looked after laga.', 'Fresh feel ne whole visit ko better bana diya.', 'Experience lively aur current feel hua.'],
    hinglish: ['Sab kuch fresh aur current laga.', 'Experience ki freshness standout thi.', 'Place ka feel lively aur clean tha.', 'Freshness ne visit ko aur enjoyable bana diya.', 'Things crisp, new aur well cared for lag rahi thi.', 'Overall freshness ne experience ko improve kiya.', 'Sab kuch clean aur updated laga.', 'Atmosphere lively thi without being noisy.', 'Freshness ek clear plus thi.', 'Place renewed aur well looked after laga.', 'Fresh feel ne whole visit ko better bana diya.', 'Experience lively aur current feel hua.']
  },
  comfort: {
    english: ['The experience felt comfortable and easy from start to finish.', 'Comfort was a big part of the positive experience.', 'The setting felt relaxed and reassuring.', 'It felt physical and emotional comfort throughout.', 'The whole visit felt easy and calm.', 'Comfort levels were high and noticeable.', 'The experience gave a sense of ease and confidence.', 'The environment made me feel comfortable immediately.', 'Everything felt smooth and genuinely comfortable.', 'Comfort stood out in a really positive way.', 'The experience was calm and stress-free.', 'The comfort factor was definitely a win.'],
    hindi: ['Experience comfortable aur easy laga start se end tak.', 'Comfort positive experience ka big part tha.', 'Setting relaxed aur reassuring thi.', 'Puri visit easy aur calm feel hui.', 'Comfort levels high aur noticeable the.', 'Experience ne ease aur confidence ka feel diya.', 'Environment ne immediately comfortable feel karaya.', 'Sab kuch smooth aur genuinely comfortable tha.', 'Comfort really positive way mein standout tha.', 'Experience calm aur stress-free tha.', 'Comfort factor definitely win tha.'],
    hinglish: ['Experience comfortable aur easy laga start se end tak.', 'Comfort positive experience ka big part tha.', 'Setting relaxed aur reassuring thi.', 'Puri visit easy aur calm feel hui.', 'Comfort levels high aur noticeable the.', 'Experience ne ease aur confidence ka feel diya.', 'Environment ne immediately comfortable feel karaya.', 'Sab kuch smooth aur genuinely comfortable tha.', 'Comfort really positive way mein standout tha.', 'Experience calm aur stress-free tha.', 'Comfort factor definitely win tha.']
  },
  professionalism: {
    english: ['The professionalism stood out clearly.', 'The team felt expert and reliable.', 'Everything was handled with a polished, professional attitude.', 'The expertise was obvious and reassuring.', 'Professionalism made the experience feel trustworthy.', 'The standard of service felt polished and competent.', 'The overall approach felt highly professional.', 'The guidance and handling felt dependable.', 'Expert care and professionalism were both visible.', 'The team carried the service with confidence and poise.', 'The professional approach really improved the experience.', 'The treatment felt precise and well informed.'],
    hindi: ['Professionalism clearly standout tha.', 'Team expert aur reliable laga.', 'Sab kuch polished, professional attitude ke sath handle hua.', 'Expertise obvious aur reassuring thi.', 'Professionalism ne experience ko trustworthy bana diya.', 'Service standard polished aur competent laga.', 'Overall approach highly professional tha.', 'Guidance aur handling dependable the.', 'Expert care aur professionalism dono visible the.', 'Team ne confidence aur poise ke sath service carry ki.', 'Professional approach ne experience ko improve kiya.', 'Treatment precise aur well informed laga.'],
    hinglish: ['Professionalism clearly standout tha.', 'Team expert aur reliable laga.', 'Sab kuch polished, professional attitude ke sath handle hua.', 'Expertise obvious aur reassuring thi.', 'Professionalism ne experience ko trustworthy bana diya.', 'Service standard polished aur competent laga.', 'Overall approach highly professional tha.', 'Guidance aur handling dependable the.', 'Expert care aur professionalism dono visible the.', 'Team ne confidence aur poise ke sath service carry ki.', 'Professional approach ne experience ko improve kiya.', 'Treatment precise aur well informed laga.']
  },
  styling: {
    english: ['The haircut and styling turned out really well.', 'The final look felt polished and proportionate.', 'The result looked clean, stylish, and confident.', 'The finish was sharp and well considered.', 'The styling matched my preference really well.', 'The overall result felt balanced and natural.', 'The cut did exactly what I wanted.', 'The finish was neat and thoughtfully done.', 'The style felt fresh and flattering.', 'The result had a confident, modern finish.', 'The look was polished and easy to carry.', 'The styling result was genuinely impressive.'],
    hindi: ['Haircut aur styling ka result really well nikla.', 'Final look polished aur proportionate laga.', 'Result clean, stylish aur confident tha.', 'Finish sharp aur well considered tha.', 'Styling preference ke hisaab se perfect tha.', 'Overall result balanced aur natural laga.', 'Cut ne exactly woh kiya jo maine chaha.', 'Finish neat aur thoughtfully done tha.', 'Style fresh aur flattering laga.', 'Result mein confident, modern finish tha.', 'Look polished aur easy to carry tha.', 'Styling result genuinely impressive tha.'],
    hinglish: ['Haircut aur styling ka result really well nikla.', 'Final look polished aur proportionate laga.', 'Result clean, stylish aur confident tha.', 'Finish sharp aur well considered tha.', 'Styling preference ke hisaab se perfect tha.', 'Overall result balanced aur natural laga.', 'Cut ne exactly woh kiya jo maine chaha.', 'Finish neat aur thoughtfully done tha.', 'Style fresh aur flattering laga.', 'Result mein confident, modern finish tha.', 'Look polished aur easy to carry tha.', 'Styling result genuinely impressive tha.']
  },
  aftercare: {
    english: ['The aftercare guidance was helpful and practical.', 'The follow-up advice made a real difference.', 'I appreciated the care instructions after the service.', 'The aftercare suggestions were useful and clear.', 'They explained how to maintain the result well.', 'The maintenance advice was genuinely useful.', 'The follow-through on care was excellent.', 'The extra guidance really added value.', 'I felt supported even after the session ended.', 'The aftercare made the overall result feel better.', 'They were thoughtful about long-term care.', 'The post-service guidance was clear and helpful.'],
    hindi: ['Aftercare guidance helpful aur practical thi.', 'Follow-up advice ne real difference diya.', 'Service ke baad care instructions ko maine appreciate kiya.', 'Aftercare suggestions useful aur clear the.', 'Unhone explain kiya kaise result maintain karna hai.', 'Maintenance advice genuinely useful tha.', 'Care par follow-through excellent tha.', 'Extra guidance ne value add ki.', 'Session ke baad bhi I felt supported.', 'Aftercare ne overall result ko aur better feel karaya.', 'Unhone long-term care ke liye thoughtful approach rakha.', 'Post-service guidance clear aur helpful thi.'],
    hinglish: ['Aftercare guidance helpful aur practical thi.', 'Follow-up advice ne real difference diya.', 'Service ke baad care instructions ko maine appreciate kiya.', 'Aftercare suggestions useful aur clear the.', 'Unhone explain kiya kaise result maintain karna hai.', 'Maintenance advice genuinely useful tha.', 'Care par follow-through excellent tha.', 'Extra guidance ne value add ki.', 'Session ke baad bhi I felt supported.', 'Aftercare ne overall result ko aur better feel karaya.', 'Unhone long-term care ke liye thoughtful approach rakha.', 'Post-service guidance clear aur helpful thi.']
  },
  timing: {
    english: ['The timing was smooth and well managed.', 'Everything moved on schedule without unnecessary delay.', 'The session was efficient and on time.', 'The timing felt organised and respectful.', 'The service was punctual and well paced.', 'The timing was convenient and easy to manage.', 'I did not feel rushed or delayed.', 'The schedule was handled thoughtfully.', 'The process kept good momentum.', 'Everything started and finished at a good pace.', 'The time flow was smooth and comfortable.', 'The timing was a clear positive.'],
    hindi: ['Timing smooth aur well managed tha.', 'Sab kuch schedule ke hisaab se hua bina delay ke.', 'Session efficient aur on time tha.', 'Timing organised aur respectful laga.', 'Service punctual aur well paced thi.', 'Timing convenient aur easy to manage tha.', 'I did not feel rushed or delayed.', 'Schedule ko thoughtfully handle kiya gaya.', 'Process ne good momentum maintain rakha.', 'Sab kuch ek good pace par start aur finish hua.', 'Time flow smooth aur comfortable tha.', 'Timing ek clear positive tha.'],
    hinglish: ['Timing smooth aur well managed tha.', 'Sab kuch schedule ke hisaab se hua bina delay ke.', 'Session efficient aur on time tha.', 'Timing organised aur respectful laga.', 'Service punctual aur well paced thi.', 'Timing convenient aur easy to manage tha.', 'I did not feel rushed or delayed.', 'Schedule ko thoughtfully handle kiya gaya.', 'Process ne good momentum maintain rakha.', 'Sab kuch ek good pace par start aur finish hua.', 'Time flow smooth aur comfortable tha.', 'Timing ek clear positive tha.']
  },
  consultation: {
    english: ['The consultation was clear and personal.', 'The advice felt thoughtful and tailored.', 'The expert guidance was practical and helpful.', 'I felt heard and understood during the consultation.', 'The guidance was detailed but easy to follow.', 'The consultation felt comfortable and informative.', 'The discussion was useful and reassuring.', 'The expert advice felt confident and relevant.', 'They explained things clearly and patiently.', 'The consultation added real value to the decision.', 'The experience felt easy to understand and trust.', 'The guidance was relevant and supportive.'],
    hindi: ['Consultation clear aur personal tha.', 'Advice thoughtful aur tailored laga.', 'Expert guidance practical aur helpful thi.', 'Main consultation ke dauran heard aur understood feel kiya.', 'Guidance detailed but easy to follow thi.', 'Consultation comfortable aur informative tha.', 'Discussion useful aur reassuring tha.', 'Expert advice confident aur relevant laga.', 'Unhone clear aur patiently explain kiya.', 'Consultation ne decision ko real value di.', 'Experience easy to understand aur trust feel hua.', 'Guidance relevant aur supportive thi.'],
    hinglish: ['Consultation clear aur personal tha.', 'Advice thoughtful aur tailored laga.', 'Expert guidance practical aur helpful thi.', 'Main consultation ke dauran heard aur understood feel kiya.', 'Guidance detailed but easy to follow thi.', 'Consultation comfortable aur informative tha.', 'Discussion useful aur reassuring tha.', 'Expert advice confident aur relevant laga.', 'Unhone clear aur patiently explain kiya.', 'Consultation ne decision ko real value di.', 'Experience easy to understand aur trust feel hua.', 'Guidance relevant aur supportive thi.']
  },
  appointment: {
    english: ['The appointment process was smooth and easy.', 'Booking felt organised and stress-free.', 'The scheduling was simple and convenient.', 'The check-in process was easy and prompt.', 'The appointment flow was efficient and clear.', 'The visit planning felt thoughtful and easy.', 'The booking experience was smooth and reassuring.', 'Everything felt organised before the visit.', 'The process felt professional and straightforward.', 'Appointment handling was quick and pleasant.', 'The scheduling was dependable and convenient.', 'The overall appointment experience was a plus.'],
    hindi: ['Appointment process smooth aur easy tha.', 'Booking organised aur stress-free laga.', 'Scheduling simple aur convenient thi.', 'Check-in process easy aur prompt tha.', 'Appointment flow efficient aur clear tha.', 'Visit planning thoughtful aur easy laga.', 'Booking experience smooth aur reassuring tha.', 'Sab kuch organised feel hua before the visit.', 'Process professional aur straightforward tha.', 'Appointment handling quick aur pleasant tha.', 'Scheduling dependable aur convenient thi.', 'Overall appointment experience ek plus tha.'],
    hinglish: ['Appointment process smooth aur easy tha.', 'Booking organised aur stress-free laga.', 'Scheduling simple aur convenient thi.', 'Check-in process easy aur prompt tha.', 'Appointment flow efficient aur clear tha.', 'Visit planning thoughtful aur easy laga.', 'Booking experience smooth aur reassuring tha.', 'Sab kuch organised feel hua before the visit.', 'Process professional aur straightforward tha.', 'Appointment handling quick aur pleasant tha.', 'Scheduling dependable aur convenient thi.', 'Overall appointment experience ek plus tha.']
  },
  facility: {
    english: ['The facility felt comfortable and well equipped.', 'The setup was practical and reliable.', 'The clinic environment felt calm and organised.', 'The equipment and space were thoughtfully arranged.', 'The facility looked clean and well maintained.', 'The setup made the visit more comfortable.', 'The facilities were easy to use and comfortable.', 'The environment felt prepared and professional.', 'The facility quality strongly supported the experience.', 'The arrangement felt efficient and supportive.', 'The infrastructure was reassuring and well planned.', 'The facility made the whole experience smoother.'],
    hindi: ['Facility comfortable aur well equipped laga.', 'Setup practical aur reliable tha.', 'Clinic environment calm aur organised tha.', 'Equipment aur space thoughtfully arranged the.', 'Facility clean aur well maintained lag raha tha.', 'Setup ne visit ko aur comfortable bana diya.', 'Facilities easy to use aur comfortable the.', 'Environment prepared aur professional laga.', 'Facility quality ne experience ko strong support diya.', 'Arrangement efficient aur supportive tha.', 'Infrastructure reassuring aur well planned tha.', 'Facility ne whole experience ko smoother bana diya.'],
    hinglish: ['Facility comfortable aur well equipped laga.', 'Setup practical aur reliable tha.', 'Clinic environment calm aur organised tha.', 'Equipment aur space thoughtfully arranged the.', 'Facility clean aur well maintained lag raha tha.', 'Setup ne visit ko aur comfortable bana diya.', 'Facilities easy to use aur comfortable the.', 'Environment prepared aur professional laga.', 'Facility quality ne experience ko strong support diya.', 'Arrangement efficient aur supportive tha.', 'Infrastructure reassuring aur well planned tha.', 'Facility ne whole experience ko smoother bana diya.']
  },
  treatment: {
    english: ['The treatment quality was strong and reassuring.', 'The care felt thoughtful and precise.', 'The result was effective and well delivered.', 'The treatment process felt calm and trustworthy.', 'The quality of care was clearly high.', 'The treatment plan felt clear and well considered.', 'The overall treatment was efficient and reassuring.', 'The care was specific, detailed, and effective.', 'The treatment made me feel more confident in the process.', 'The care approach was professional and calming.', 'The treatment experience felt dependable and well executed.', 'The level of care felt strong and consistent.'],
    hindi: ['Treatment quality strong aur reassuring thi.', 'Care thoughtful aur precise laga.', 'Result effective aur well delivered tha.', 'Treatment process calm aur trustworthy tha.', 'Care quality clearly high thi.', 'Treatment plan clear aur well considered tha.', 'Overall treatment efficient aur reassuring tha.', 'Care specific, detailed aur effective thi.', 'Treatment ne process par zyada confidence diya.', 'Care approach professional aur calming tha.', 'Treatment experience dependable aur well executed laga.', 'Care level strong aur consistent feel hua.'],
    hinglish: ['Treatment quality strong aur reassuring thi.', 'Care thoughtful aur precise laga.', 'Result effective aur well delivered tha.', 'Treatment process calm aur trustworthy tha.', 'Care quality clearly high thi.', 'Treatment plan clear aur well considered tha.', 'Overall treatment efficient aur reassuring tha.', 'Care specific, detailed aur effective thi.', 'Treatment ne process par zyada confidence diya.', 'Care approach professional aur calming tha.', 'Treatment experience dependable aur well executed laga.', 'Care level strong aur consistent feel hua.']
  },
  communication: {
    english: ['The communication was clear and reassuring.', 'The explanations were thoughtful and understandable.', 'I felt informed and supported throughout.', 'The guidance was clear and easy to follow.', 'The team explained everything without rushing me.', 'The communication style felt warm and confident.', 'I always felt informed about what was happening.', 'The explanation quality was strong and helpful.', 'The information was clear and easy to trust.', 'The clinician communicated with care and patience.', 'The communication made the whole process smoother.', 'The guidance was detailed but reassuring.'],
    hindi: ['Communication clear aur reassuring thi.', 'Explanations thoughtful aur understandable the.', 'Main throughout informed aur supported feel kiya.', 'Guidance clear aur easy to follow thi.', 'Team ne bina rush ke sab explain kiya.', 'Communication style warm aur confident tha.', 'Main hamesha informed feel karta tha.', 'Explanation quality strong aur helpful thi.', 'Information clear aur easy to trust thi.', 'Clinician ne care aur patience ke sath communicate kiya.', 'Communication ne whole process ko smoother bana diya.', 'Guidance detailed but reassuring thi.'],
    hinglish: ['Communication clear aur reassuring thi.', 'Explanations thoughtful aur understandable the.', 'Main throughout informed aur supported feel kiya.', 'Guidance clear aur easy to follow thi.', 'Team ne bina rush ke sab explain kiya.', 'Communication style warm aur confident tha.', 'Main hamesha informed feel karta tha.', 'Explanation quality strong aur helpful thi.', 'Information clear aur easy to trust thi.', 'Clinician ne care aur patience ke sath communicate kiya.', 'Communication ne whole process ko smoother bana diya.', 'Guidance detailed but reassuring thi.']
  },
  waiting: {
    english: ['The wait time was reasonable and manageable.', 'I did not feel the waiting time was excessive.', 'The process was prompt without feeling rushed.', 'Waiting felt fair and within expectations.', 'The turnaround was efficient and comfortable.', 'The waiting experience was smooth and acceptable.', 'The time spent waiting was not frustrating.', 'The delay, if any, was minor and handled well.', 'The process stayed on pace without long delays.', 'The expected wait was reasonable and polite.', 'The waiting period felt fair and well managed.', 'The timing was smooth enough to keep the experience positive.'],
    hindi: ['Wait time reasonable aur manageable tha.', 'Mujhe wait time excessive feel nahi hua.', 'Process prompt tha bina rushed feel kiye.', 'Waiting fair aur expectations ke andar thi.', 'Turnaround efficient aur comfortable tha.', 'Waiting experience smooth aur acceptable tha.', 'Waiting ka time frustrating nahi tha.', 'Delay minor tha aur well handled tha.', 'Process pace par raha bina long delays ke.', 'Expected wait reasonable aur polite tha.', 'Waiting period fair aur well managed laga.', 'Timing smooth enough thi ki experience positive raha.'],
    hinglish: ['Wait time reasonable aur manageable tha.', 'Mujhe wait time excessive feel nahi hua.', 'Process prompt tha bina rushed feel kiye.', 'Waiting fair aur expectations ke andar thi.', 'Turnaround efficient aur comfortable tha.', 'Waiting experience smooth aur acceptable tha.', 'Waiting ka time frustrating nahi tha.', 'Delay minor tha aur well handled tha.', 'Process pace par raha bina long delays ke.', 'Expected wait reasonable aur polite tha.', 'Waiting period fair aur well managed laga.', 'Timing smooth enough thi ki experience positive raha.']
  },
  accessibility: {
    english: ['The accessibility was smooth and easy to navigate.', 'The place was comfortable to reach and use.', 'Everything felt easy to approach and manage.', 'The access experience was straightforward and respectful.', 'The layout and access were practical and reassuring.', 'The setup made the visit comfortable and easy to manage.', 'The location felt simple to navigate.', 'Accessibility was a clear positive.', 'The service was easy to reach and use.', 'The overall access experience felt fair and well thought through.', 'The place was easy to approach and comfortable to use.', 'The access flow was simple and thoughtful.'],
    hindi: ['Accessibility smooth aur easy to navigate thi.', 'Place reach aur use karna comfortable tha.', 'Sab kuch approach aur manage karna easy tha.', 'Access experience straightforward aur respectful tha.', 'Layout aur access practical aur reassuring the.', 'Setup ne visit ko comfortable aur easy to manage bana diya.', 'Location simple to navigate thi.', 'Accessibility ek clear positive tha.', 'Service reach aur use karna easy tha.', 'Overall access experience fair aur well thought through laga.', 'Place easy to approach aur comfortable to use tha.', 'Access flow simple aur thoughtful tha.'],
    hinglish: ['Accessibility smooth aur easy to navigate thi.', 'Place reach aur use karna comfortable tha.', 'Sab kuch approach aur manage karna easy tha.', 'Access experience straightforward aur respectful tha.', 'Layout aur access practical aur reassuring the.', 'Setup ne visit ko comfortable aur easy to manage bana diya.', 'Location simple to navigate thi.', 'Accessibility ek clear positive tha.', 'Service reach aur use karna easy tha.', 'Overall access experience fair aur well thought through laga.', 'Place easy to approach aur comfortable to use tha.', 'Access flow simple aur thoughtful tha.']
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

const readLibrary = (category, language) => {
  const filePath = path.join(templateRoot, category, `${language}.json`);
  if (!fs.existsSync(filePath)) {
    const fallback = path.join(templateRoot, category, 'english.json');
    if (!fs.existsSync(fallback)) {
      throw new Error(`No template library found for ${category}/${language}`);
    }
    return JSON.parse(fs.readFileSync(fallback, 'utf8'));
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

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

const sentenceWithBusiness = (text, businessName, contactName = '', location = '') =>
  String(text)
    .replace(/\{businessName\}/g, businessName || 'this business')
    .replace(/\{contactName\}/g, contactName || 'the team')
    .replace(/\{contactPhone\}/g, 'the contact line')
    .replace(/\{location\}/g, location || 'this area');

const pickOne = (list = []) => {
  if (!list.length) return '';
  return list[Math.floor(Math.random() * list.length)];
};

const pickMany = (list = [], count = 1) => {
  if (!list.length || count <= 0) return [];
  const copy = [...list].sort(() => Math.random() - 0.5);
  return copy.slice(0, Math.min(count, copy.length));
};

const simplifyCustomerNote = (value = '') => {
  const clean = String(value).trim();
  if (!clean) return '';
  return clean.replace(/\s+/g, ' ').slice(0, 220);
};

const summarizeBusinessProfile = (businessProfileJson = '', businessSummary = '') => {
  const directSummary = String(businessSummary || '').trim();
  if (directSummary) return directSummary;

  const trimmedProfile = String(businessProfileJson || '').trim();
  if (!trimmedProfile) {
    return 'This business offers quality service and a good customer experience.';
  }

  try {
    const parsed = JSON.parse(trimmedProfile);
    if (!parsed || typeof parsed !== 'object') return directSummary || trimmedProfile;

    const parts = [];
    if (parsed.business_name) parts.push(`${parsed.business_name}`);
    if (parsed.category) parts.push(`a ${parsed.category}`);
    if (parsed.location) parts.push(`in ${parsed.location}`);
    if (Array.isArray(parsed.specialties) && parsed.specialties.length) {
      parts.push(`known for ${parsed.specialties.slice(0, 4).join(', ')}`);
    }
    if (Array.isArray(parsed.experience_highlights) && parsed.experience_highlights.length) {
      parts.push(`with highlights like ${parsed.experience_highlights.slice(0, 3).join(', ')}`);
    }
    if (Array.isArray(parsed.cuisine) && parsed.cuisine.length) {
      parts.push(`serving ${parsed.cuisine.slice(0, 4).join(', ')}`);
    }

    const text = parts.join(' ');
    return text || trimmedProfile;
  } catch {
    return trimmedProfile;
  }
};

export function buildReviewGenerationPrompt({
  businessName = 'this business',
  businessCategory = 'restaurant',
  selectedCategories = [],
  description = '',
  tone = 'natural',
  language = 'Hinglish',
  businessSummary = '',
  businessProfileJson = '',
  businessLocation = ''
}) {
  const tags = Array.isArray(selectedCategories) && selectedCategories.length
    ? uniqueText(selectedCategories.map((item) => String(item).trim()).filter(Boolean)).join(', ')
    : 'general experience';

  const summaryText = summarizeBusinessProfile(businessProfileJson, businessSummary);
  const locationText = String(businessLocation || '').trim();

  return [
    'Generate a customer review for the business below.',
    `Business name: ${businessName}`,
    `Business category: ${businessCategory}`,
    `Selected review tags: ${tags}`,
    `Business summary: ${summaryText}`,
    `Business profile JSON: ${businessProfileJson || 'not provided'}`,
    `Tone: ${tone}`,
    `Language: ${language}`,
    `Review length: short and concise`,
    `Customer experience note: ${String(description || '').trim() || 'No extra note provided.'}`,
    locationText ? `Business location: ${locationText}` : 'Business location: not provided',
    'CRITICAL REQUIREMENTS:',
    '- MUST BE CONCISE: 1 to 2 short sentences, maximum 3 (keep it under 35-45 words).',
    '- Write in a natural, believable customer voice as if posting on Google Maps from a phone.',
    '- Keep the review focused on the selected tags and the customer note.',
    '- Do not write long paragraphs, greetings, titles, bullet points, or filler.',
    '- Do not use quotes around the review.',
    '- Do not mention AI or automation.',
    `- Write in ${language}. (If Hinglish, write natural conversational Hinglish in Latin script).`
  ].join('\n');
}

export function generateReview({
  businessCategory = 'restaurant',
  selectedCategories = [],
  description = '',
  tone = 'natural',
  language = 'Hinglish',
  businessName = 'this business',
  contactName = '',
  contactPhone = '',
  businessLocation = '',
  businessSummary = ''
}) {
  const category = resolveCategory(businessCategory);
  const lang = resolveLanguage(language);
  const templateTone = resolveTone(tone);

  const library = readLibrary(category, lang);
  const categoryKeys = uniqueText(
    selectedCategories
      .map((item) => canonicalizeCategory(item))
      .filter(Boolean)
  );

  const personalizedIntro = sentenceWithBusiness(
    pickOne(library.openings?.[templateTone] || library.openings?.natural || [
      'My visit to {businessName} was a great experience.'
    ]),
    businessName,
    contactName,
    businessLocation
  );

  const contextNotes = [];
  if (businessLocation) {
    contextNotes.push(`I visited ${businessName} in ${businessLocation}.`);
  }

  const normalizeReviewLength = (text = '') => {
    const clean = String(text).replace(/\s+/g, ' ').trim();
    if (clean.length <= 180) return clean;
    return clean.slice(0, 177).trimEnd().replace(/[,;:-]?$/, '.') || clean;
  };

  if (!categoryKeys.length && !description) {
    const genericClose = sentenceWithBusiness(
      pickOne(library.closings?.[templateTone] || library.closings?.natural || [
        'Overall, it was a fair experience and I appreciated the effort.'
      ]),
      businessName,
      contactName,
      businessLocation
    );
    const reviewSegments = [personalizedIntro, ...contextNotes, genericClose];
    return normalizeReviewLength(uniqueText(reviewSegments).join(' ').replace(/\s+/g, ' ').trim());
  }

  const customerNote = simplifyCustomerNote(description);
  const reviewSegments = [personalizedIntro, ...contextNotes];

  if (categoryKeys.length) {
    const selectedPools = categoryKeys.flatMap((key) => {
      const basePool = library.components?.[key] || [];
      const expandedPool = phraseCatalog[key]?.[lang] || phraseCatalog[key]?.english || [];
      return uniqueText([...basePool, ...expandedPool]);
    });

    const phraseLimit = customerNote ? 1 : (templateTone === 'detailed' ? 2 : 1);
    const chosenPhrases = uniqueText(pickMany(selectedPools, phraseLimit));
    if (chosenPhrases.length) {
      reviewSegments.push(...chosenPhrases.map((phrase) => String(phrase).trim()));
    }
  }

  if (customerNote) {
    const noteTemplates = languageMap[lang] === 'hinglish'
      ? [
          'Ek point jo standout raha, woh tha {detail}',
          'Mere liye important detail tha {detail}',
          'Main specifically {detail} ko notice mein rakha',
          'Mera personal note tha {detail}'
        ]
      : [
          'One thing that stood out to me was: {detail}',
          'My personal note was: {detail}',
          'A few details that mattered to me were: {detail}'
        ];
    const noteTemplate = pickOne(library.additionalDetails || noteTemplates);
    reviewSegments.push(sentenceWithBusiness(noteTemplate.replace('{detail}', customerNote), businessName, contactName, businessLocation));
  }

  const closing = sentenceWithBusiness(
    pickOne(library.closings?.[templateTone] || library.closings?.natural || [
      'Overall, it was a useful experience and I would consider visiting again.'
    ]),
    businessName,
    contactName,
    businessLocation
  );

  reviewSegments.push(closing);

  const finalText = uniqueText(reviewSegments)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizeReviewLength(finalText);
}

export function getCategoryDefinitions(category = 'restaurant') {
  const resolvedCategory = resolveCategory(category);
  const library = readLibrary(resolvedCategory, 'english');
  return library.categoryOptions || {};
}

export function getAvailableTemplates() {
  const categories = ['restaurant', 'salon', 'clinic'];
  const languages = ['english', 'hindi', 'hinglish'];
  const result = {};

  for (const category of categories) {
    result[category] = {};
    for (const language of languages) {
      try {
        result[category][language] = readLibrary(category, language);
      } catch {
        result[category][language] = null;
      }
    }
  }

  return result;
}

export function previewTemplateSummary() {
  const summary = {};
  for (const category of Object.keys(getAvailableTemplates())) {
    summary[category] = Object.keys(getAvailableTemplates()[category]).filter((lang) => getAvailableTemplates()[category][lang]);
  }
  return summary;
}

export function getBusinessCatalog() {
  return [
    {
      category: 'restaurant',
      businessName: 'The Coffee House',
      slug: 'the-coffee-house',
      welcomeMessage: 'Thanks for visiting us. We would love to hear about your experience.'
    },
    {
      category: 'salon',
      businessName: 'Royal Salon Studio',
      slug: 'royal-salon-studio',
      welcomeMessage: 'We value your honest feedback and would love to know how we did.'
    },
    {
      category: 'clinic',
      businessName: 'City Dental Clinic',
      slug: 'city-dental-clinic',
      welcomeMessage: 'Your feedback helps us improve the care and comfort we provide.'
    }
  ];
}

import OpenAI from 'openai';

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
        generationConfig: { temperature: 0.7, maxOutputTokens: 120 }
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

  console.info('[LLM] Sending request for review generation via', baseUrl);

  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
    timeout: timeoutMs,
    dangerouslyAllowBrowser: false
  });

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
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
    businessSummary,
    businessProfileJson,
    businessLocation: normalized.businessLocation
  });

  if (typeof llmRequest === 'function') {
    try {
      const timeoutMs = 20000;
      const response = await Promise.race([
        llmRequest({
          model: process.env.LLM_MODEL || process.env.SENSENOVA_MODEL || 'sensenova-6.8-flash-lite',
          apiKey: llmApiKey || geminiApiKey || senseNovaApiKey,
          prompt,
          baseUrl: process.env.LLM_BASE_URL || 'https://token.sensenova.ai/v1'
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timed out after 20 seconds')), timeoutMs))
      ]);
      const text = String(response || '').trim();
      if (text) return text;
    } catch (error) {
      console.warn('[LLM] custom request failed:', error?.message || error);
    }
  } else {
    // Primary: Gemini
    if (geminiApiKey) {
      try {
        console.info('[LLM] Trying primary Gemini provider');
        const text = String(await callGeminiReviewGenerator({ apiKey: geminiApiKey, prompt })).trim();
        if (text) return text;
      } catch (error) {
        console.warn('[LLM] Gemini primary failed, falling back to SenseNova:', error?.message || error);
      }
    }

    // Secondary: SenseNova
    if (senseNovaApiKey) {
      try {
        console.info('[LLM] Trying secondary SenseNova provider');
        const text = String(await callXaiReviewGenerator({
          apiKey: senseNovaApiKey,
          prompt,
          model: process.env.SENSENOVA_MODEL || process.env.LLM_MODEL || 'sensenova-6.8-flash-lite',
          baseUrl: process.env.LLM_BASE_URL || process.env.SENSENOVA_BASE_URL || 'https://token.sensenova.ai/v1'
        })).trim();
        if (text) return text;
      } catch (error) {
        console.warn('[LLM] SenseNova secondary failed, falling back to local generator:', error?.message || error);
      }
    } else {
      console.warn('[LLM] No SenseNova provider key available. Using local review generator instead.');
    }
  }

  return generateReview({
    businessCategory: normalized.businessCategory,
    selectedCategories: normalized.selectedCategories,
    description: normalized.description,
    tone: normalized.tone,
    language: normalized.language,
    businessName: normalized.businessName,
    businessLocation: normalized.businessLocation,
    businessSummary,
    businessProfileJson
  });
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
