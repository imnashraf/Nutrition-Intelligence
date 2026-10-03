/**
 * SAMPLE DATA ONLY.
 * Used by `client.ts` until the real endpoints are connected.
 * Safe to delete once every function in `client.ts` calls your backend.
 */
import type { Answer, Conversation, StarterPrompt, TryPrompt } from './types';

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    topic: 'dietary-guidance',
    label: 'Dietary guidance',
    question: 'What foods are part of a healthy diet?',
  },
  {
    topic: 'food-safety',
    label: 'Food safety',
    question: 'How can I keep food safe when preparing meals?',
  },
  {
    topic: 'food-safety',
    label: 'Food safety',
    question: 'What temperature should chicken be cooked to?',
  },
  {
    topic: 'food-safety',
    label: 'Food safety',
    question: 'What are the five keys to safer food?',
  },
];

export const TRY_PROMPTS: TryPrompt[] = [
  { label: 'Healthy diet basics', question: 'What foods are part of a healthy diet?' },
  { label: 'Safe meal prep', question: 'How can I keep food safe when preparing meals?' },
  { label: 'Chicken cooking temperature', question: 'What temperature should chicken be cooked to?' },
  { label: 'Five keys to safer food', question: 'What are the five keys to safer food?' },
];


