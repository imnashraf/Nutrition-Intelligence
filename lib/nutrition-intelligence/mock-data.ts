/**
 * SAMPLE DATA ONLY.
 * Used by `client.ts` until the real endpoints are connected.
 * Safe to delete once every function in `client.ts` calls your backend.
 */
import type { Answer, Conversation, StarterPrompt } from './types';

export const SAMPLE_ACCOUNT_INITIALS = 'MN';

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    topic: 'nutrition',
    label: 'Nutrition',
    question: 'How much protein do I need if I strength train?',
  },
  {
    topic: 'dietary-guidance',
    label: 'Dietary guidance',
    question: 'Is oat milk as nutritious as dairy milk?',
  },
  {
    topic: 'food-safety',
    label: 'Food safety',
    question: 'How long can cooked chicken stay in the fridge?',
  },
  {
    topic: 'research',
    label: 'What the research says',
    question: 'Does intermittent fasting beat regular calorie control?',
  },
];

const proteinAnswer: Answer = {
  topic: 'nutrition',
  evidence: 'strong',
  shortAnswer: [
    'Aim for about ',
    { strong: '1.6 g of protein per kg of body weight a day' },
    '. That captures nearly all of the muscle-building benefit for most people who lift regularly. Going higher, up to around 2.2 g/kg, gives a margin but adds little for most.',
  ],
  body: [
    [
      'The everyday recommendation of 0.8 g/kg is set to prevent deficiency in the general population, not to support training',
      { cite: 4 },
      '.',
    ],
    [
      'When researchers pooled 49 resistance-training trials, gains in muscle mass levelled off at around 1.6 g/kg a day, with the upper end of the estimate near 2.2 g/kg',
      { cite: 1 },
      '. Sports nutrition bodies land in the same place, recommending 1.4–2.0 g/kg for people who exercise regularly',
      { cite: 2 },
      '.',
    ],
  ],
  practice: [
    { label: 'For a 70 kg person', content: ['About 110 g of protein a day.'] },
    {
      label: 'Spread it out',
      content: ['Roughly 0.4 g/kg per meal across four meals, around 25–30 g each', { cite: 3 }, '.'],
    },
    {
      label: 'Food first',
      content: [
        'Eggs, Greek yogurt, fish, legumes, tofu and lean meat cover this for most people without supplements.',
      ],
    },
  ],
  caveat:
    "If you have kidney disease or have been told to limit protein, follow your clinician's guidance instead.",
  sources: [
    {
      number: 1,
      title:
        'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',
      authors: 'Morton RW, Murphy KT, McKellar SR, et al.',
      publication: 'British Journal of Sports Medicine',
      year: 2018,
      type: 'Meta-analysis',
      url: 'https://doi.org/10.1136/bjsports-2017-097608',
      supports: 'Muscle gains level off at around 1.6 g/kg a day, with an upper estimate near 2.2 g/kg.',
    },
    {
      number: 2,
      title: 'International Society of Sports Nutrition position stand: protein and exercise',
      authors: 'Jäger R, Kerksick CM, Campbell BI, et al.',
      publication: 'Journal of the International Society of Sports Nutrition',
      year: 2017,
      type: 'Position stand',
      url: 'https://doi.org/10.1186/s12970-017-0177-8',
      supports: '1.4–2.0 g/kg a day is recommended for people who exercise regularly.',
    },
    {
      number: 3,
      title: 'How much protein can the body use in a single meal for muscle-building? Implications for daily protein distribution',
      authors: 'Schoenfeld BJ, Aragon AA',
      publication: 'Journal of the International Society of Sports Nutrition',
      year: 2018,
      type: 'Review',
      url: 'https://doi.org/10.1186/s12970-018-0215-1',
      supports: 'Around 0.4 g/kg per meal across at least four meals.',
    },
    {
      number: 4,
      title:
        'Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids',
      authors: 'Institute of Medicine',
      publication: 'The National Academies Press',
      year: 2005,
      type: 'Guideline',
      url: 'https://doi.org/10.17226/10490',
      supports: 'The general recommendation of 0.8 g/kg a day for adults.',
    },
  ],
  followUps: [
    'Does protein timing after a workout matter?',
    'Are plant proteins as effective?',
    'How does this change after 60?',
  ],
};

const riceAnswer: Answer = {
  topic: 'food-safety',
  evidence: 'official-guidance',
  action: [
    'Cool it within an hour, keep it in the fridge, and eat it within a day. Reheat it only once, until it is steaming hot all the way through',
    { cite: 1 },
    '.',
  ],
  shortAnswer: ['Yes, as long as it was cooled quickly, kept cold and eaten within a day.'],
  body: [
    [
      'Uncooked rice can contain spores of bacteria that survive cooking. If cooked rice is left at room temperature, the spores can grow into bacteria that produce toxins, and reheating will not remove them',
      { cite: 1 },
      '.',
    ],
  ],
  practice: [
    { label: 'Cooling', content: ['Spread it out in a shallow container so it cools faster.'] },
    { label: 'Not sure?', content: ['If it sat out for a long time, throw it away.'] },
  ],
  sources: [
    {
      number: 1,
      title: 'Can reheating rice cause food poisoning?',
      authors: 'NHS',
      publication: 'NHS food safety guidance',
      year: null,
      type: 'Public health guidance',
      supports: 'Cool rice within an hour, refrigerate, eat within a day and reheat only once until steaming hot.',
    },
  ],
  followUps: ['Is it the same for pasta?', 'Can I freeze cooked rice?'],
};

const chickenAnswer: Answer = {
  topic: 'food-safety',
  evidence: 'official-guidance',
  action: [
    'Eat cooked chicken within 3–4 days. Keep it at 4 °C (40 °F) or below, and reheat it to 74 °C (165 °F)',
    { cite: 1 },
    '.',
  ],
  shortAnswer: ['3–4 days in the fridge, if it went in within two hours of cooking.'],
  body: [
    [
      'Refrigerate leftovers within two hours of cooking, or within one hour on a very hot day. After 3–4 days the risk of food poisoning rises, even if it still looks and smells fine',
      { cite: 1 },
      '.',
    ],
    ['For longer storage, freeze it. Cooked poultry keeps its best quality for 2–6 months in the freezer', { cite: 2 }, '.'],
  ],
  practice: [
    { label: 'Label it', content: ["Write the date on the container so you're not guessing."] },
    { label: 'Thawing', content: ['Thaw frozen leftovers in the fridge, not on the counter.'] },
  ],
  sources: [
    {
      number: 1,
      title: 'Leftovers and Food Safety',
      authors: 'USDA Food Safety and Inspection Service',
      publication: 'USDA FSIS',
      year: null,
      type: 'Public health guidance',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety',
      supports: 'Leftovers keep 3–4 days refrigerated and should be reheated to 165 °F (74 °C).',
    },
    {
      number: 2,
      title: 'Cold Food Storage Chart',
      authors: 'FoodSafety.gov',
      publication: 'U.S. Department of Health and Human Services',
      year: null,
      type: 'Public health guidance',
      url: 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts',
      supports: 'Cooked poultry keeps 2–6 months frozen for best quality.',
    },
  ],
  followUps: ['How do I reheat chicken safely?', 'What about cooked rice?'],
};

const oatMilkAnswer: Answer = {
  topic: 'dietary-guidance',
  evidence: 'strong',
  shortAnswer: [
    'Not quite. Oat milk has ',
    { strong: 'much less protein' },
    ' than dairy milk. If it is fortified, it can match dairy for calcium and vitamin D.',
  ],
  body: [
    [
      'A cup of cow’s milk has about 8 g of protein. Most oat milks have 2–4 g',
      { cite: 1 },
      '. Among plant milks, soy is the closest match to dairy overall',
      { cite: 2 },
      '.',
    ],
  ],
  practice: [
    { label: 'Check the label', content: ['Look for added calcium, vitamin D and vitamin B12.'] },
    { label: 'Make up protein', content: ['If you swap, get protein from other foods during the day.'] },
  ],
  sources: [
    {
      number: 1,
      title: 'FoodData Central',
      authors: 'U.S. Department of Agriculture',
      publication: 'USDA Agricultural Research Service',
      year: null,
      type: 'Food composition data',
      url: 'https://fdc.nal.usda.gov/',
      supports: 'Protein content of cow’s milk and oat-based drinks.',
    },
    {
      number: 2,
      title: "How well do plant based alternatives fare nutritionally compared to cow's milk?",
      authors: 'Vanga SK, Raghavan V',
      publication: 'Journal of Food Science and Technology',
      year: 2018,
      type: 'Review',
      url: 'https://doi.org/10.1007/s13197-017-2915-y',
      supports: 'Soy milk is the closest plant-based match to cow’s milk nutritionally.',
    },
  ],
  followUps: ['Which plant milk has the most protein?', 'Is oat milk bad for blood sugar?'],
};

export const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'protein-strength-training',
    title: 'Protein for strength training',
    topic: 'nutrition',
    updatedAt: '2026-10-02T09:40:00+04:00',
    turns: [
      {
        id: 't-protein-1',
        question: 'How much protein do I actually need if I strength train four times a week?',
        askedAt: '2026-10-02T09:40:00+04:00',
        status: 'complete',
        answer: proteinAnswer,
      },
    ],
  },
  {
    id: 'leftover-rice',
    title: 'Eating leftover rice',
    topic: 'food-safety',
    updatedAt: '2026-10-02T08:15:00+04:00',
    turns: [
      {
        id: 't-rice-1',
        question: 'Can I eat leftover rice the next day?',
        askedAt: '2026-10-02T08:15:00+04:00',
        status: 'complete',
        answer: riceAnswer,
      },
    ],
  },
  {
    id: 'cooked-chicken-fridge',
    title: 'Cooked chicken in the fridge',
    topic: 'food-safety',
    updatedAt: '2026-09-29T19:05:00+04:00',
    turns: [
      {
        id: 't-chicken-1',
        question: 'How long can cooked chicken stay in the fridge?',
        askedAt: '2026-09-29T19:05:00+04:00',
        status: 'complete',
        answer: chickenAnswer,
      },
    ],
  },
  {
    id: 'oat-vs-dairy-milk',
    title: 'Oat milk vs dairy milk',
    topic: 'dietary-guidance',
    updatedAt: '2026-09-12T13:20:00+04:00',
    turns: [
      {
        id: 't-oat-1',
        question: 'Is oat milk as nutritious as dairy milk?',
        askedAt: '2026-09-12T13:20:00+04:00',
        status: 'complete',
        answer: oatMilkAnswer,
      },
    ],
  },
];

/** Shown for questions the sample data has no answer for. */
export const SAMPLE_PLACEHOLDER_ANSWER: Answer = {
  topic: 'nutrition',
  shortAnswer: ['Sample answer. Your live assistant’s response will appear here.'],
  body: [],
  sources: [],
  followUps: [],
};

/** Keyword routing for the mock `askQuestion`. */
export const SAMPLE_MATCHERS: { pattern: RegExp; conversationId: string }[] = [
  { pattern: /protein|strength|muscle|lift/i, conversationId: 'protein-strength-training' },
  { pattern: /rice/i, conversationId: 'leftover-rice' },
  { pattern: /chicken|leftover|fridge/i, conversationId: 'cooked-chicken-fridge' },
  { pattern: /oat|dairy|plant milk|milk/i, conversationId: 'oat-vs-dairy-milk' },
];
