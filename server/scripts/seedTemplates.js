import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(process.cwd(), 'server/data/reviewTemplates');
const categories = ['restaurant', 'salon', 'clinic'];
const languages = ['english', 'hindi', 'hinglish'];

for (const category of categories) {
  const categoryDir = path.join(rootDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  for (const language of languages) {
    const filePath = path.join(categoryDir, `${language}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            category,
            language: language.charAt(0).toUpperCase() + language.slice(1),
            openings: {
              simple: ['My visit to {businessName} was a reasonable experience.', 'I had a visit to {businessName} and it was okay overall.'],
              natural: ['I visited {businessName} and had a straightforward experience.', 'My visit to {businessName} was a mix of good and useful moments.'],
              professional: ['I visited {businessName} and had a balanced experience.', 'My recent experience at {businessName} was practical and informative.'],
              detailed: ['I recently visited {businessName} and took time to assess my experience.', 'I had the opportunity to visit {businessName}, and here is my honest feedback.'],
              friendly: ['I had a good visit to {businessName} and wanted to share my honest take.', 'I enjoyed my time at {businessName} and wanted to share my experience.'],
              casual: ['I checked out {businessName} and here is my take.', 'I decided to visit {businessName} and it was a fairly smooth experience.']
            },
            closings: {
              simple: ['Overall, it was a decent experience.', 'The visit was fair and worth considering.'],
              natural: ['Overall, it felt worthwhile and I would consider visiting again.', 'It was a fair experience, and I appreciated the effort.'],
              professional: ['Overall, the experience was acceptable and useful to assess.', 'The visit was balanced, and I would consider it a fair experience.'],
              detailed: ['Overall, the visit felt practical, and the details mattered to me.', 'Overall, this was a reasonable experience with room for continued improvement.'],
              friendly: ['I would happily recommend it to others for a straightforward visit.', 'I would say it was a good enough visit and worth a try.'],
              casual: ['That was my honest take, and I would still consider going back.', 'Overall, it was a fair experience and not a bad visit.']
            },
            additionalDetails: ['One thing that stood out was {detail}', 'A detail that mattered to me was {detail}', 'I especially noticed {detail}'],
            components: {
              foodquality: ['The food quality was satisfying.', 'The meals were prepared well and felt fresh.'],
              taste: ['The taste was good and enjoyable.', 'The flavours felt balanced and pleasant.'],
              affordability: ['The pricing felt reasonable for the experience.', 'The cost matched the overall value.'],
              staff: ['The staff were polite and helpful.', 'The team was approachable and professional.'],
              ambience: ['The ambience felt comfortable and welcoming.', 'The environment was pleasant and relaxing.'],
              cleanliness: ['The place was clean and well maintained.', 'It felt neat and tidy throughout the visit.'],
              service: ['The service was smooth and timely.', 'The experience felt easy and efficient.'],
              location: ['The location was convenient and easy to reach.', 'The place was easy to find and access.'],
              overall: ['The overall experience was steady and pleasant.', 'Overall, it felt like a good visit.'],
              professionalism: ['The professionalism stood out during the visit.', 'The service felt polished and consistent.'],
              haircutquality: ['The haircut result was decent and met my expectations.', 'The work felt neat and considered.'],
              hygiene: ['The hygiene standards felt reassuring.', 'The cleanliness and hygiene were clearly maintained.'],
              pricing: ['The pricing was reasonable and fair.', 'The value for the service felt acceptable.'],
              doctorcommunication: ['The doctor explained things clearly and patiently.', 'The communication was thoughtful and understandable.'],
              waitingtime: ['The waiting time was manageable and reasonable.', 'The visit was efficient, and waiting was not too long.'],
              appointmentexperience: ['The appointment process was easy and well organized.', 'The booking and appointment flow felt convenient.'],
              facility: ['The facility felt comfortable and well equipped.', 'The clinic environment was clean and practical.']
            },
            categoryOptions: {
              restaurant: ['foodquality', 'taste', 'affordability', 'staff', 'ambience', 'cleanliness', 'service', 'location', 'overall'],
              salon: ['staff', 'haircutquality', 'professionalism', 'pricing', 'hygiene', 'ambience', 'service'],
              clinic: ['staff', 'doctorcommunication', 'waitingtime', 'cleanliness', 'appointmentexperience', 'facility']
            }
          },
          null,
          2
        )
      );
    }
  }
}

console.log('Review templates seeded successfully.');
