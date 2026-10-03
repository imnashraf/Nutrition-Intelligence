import type { EvidenceLevel, Topic } from './types';

export const TOPIC_LABELS: Record<Topic, string> = {
  nutrition: 'Nutrition',
  'dietary-guidance': 'Dietary guidance',
  'food-safety': 'Food safety',
  research: 'What the research says',
};

export const TOPIC_OPTIONS: { value: Topic | 'any'; label: string }[] = [
  { value: 'any', label: 'All topics' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'dietary-guidance', label: 'Dietary guidance' },
  { value: 'food-safety', label: 'Food safety' },
  { value: 'research', label: 'Research' },
];

export const EVIDENCE: Record<EvidenceLevel, { label: string; bars: 1 | 2 | 3 }> = {
  strong: { label: 'Strong evidence', bars: 3 },
  moderate: { label: 'Moderate evidence', bars: 2 },
  emerging: { label: 'Emerging evidence', bars: 1 },
  'official-guidance': { label: 'Official guidance', bars: 3 },
};
