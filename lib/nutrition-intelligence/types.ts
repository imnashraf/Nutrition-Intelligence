/**
 * Nutrition Intelligence — frontend data contracts.
 *
 * These types are the boundary between the UI and your existing backend.
 * Map your API responses onto these shapes inside `client.ts`; the
 * components never talk to the network directly.
 */

export type Topic = 'nutrition' | 'dietary-guidance' | 'food-safety' | 'research';

/** How certain the underlying evidence is. Drives the evidence badge. */
export type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'official-guidance';

export interface Source {
  /** Citation number as shown in the answer text (1-based). */
  number: number;
  title: string;
  authors: string;
  publication: string;
  year: number | null;
  /** Short label such as "Meta-analysis", "Guideline", "Review". */
  type: string;
  /** Link to the original source, if available. */
  url?: string;
  /** The claim in this answer that the source supports. */
  supports: string;
}

/**
 * Inline rich text. An answer paragraph is an array of these nodes, so
 * citations stay structured rather than being parsed out of markdown.
 */
export type InlineNode = string | { cite: number } | { strong: string };
export type RichText = InlineNode[];

export interface PracticeItem {
  label: string;
  content: RichText;
}

export interface Answer {
  topic: Topic;
  /** Omit when the backend has no evidence grade for this answer. */
  evidence?: EvidenceLevel;
  /** One-sentence answer shown in the "Short answer" card. */
  shortAnswer: RichText;
  /** Food-safety answers lead with the action to take ("Do this"). */
  action?: RichText;
  /** Supporting reasoning, one entry per paragraph. */
  body: RichText[];
  practice?: PracticeItem[];
  caveat?: string;
  sources: Source[];
  followUps: string[];
}

export type TurnStatus = 'pending' | 'complete' | 'error';

export interface Turn {
  id: string;
  question: string;
  askedAt: string; // ISO 8601
  status: TurnStatus;
  answer?: Answer;
  /** Human-readable message for status === 'error'. */
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  topic: Topic;
  updatedAt: string; // ISO 8601
  turns: Turn[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  topic: Topic;
  updatedAt: string; // ISO 8601
  /** First line of the latest short answer, for the history list. */
  preview: string;
}

export interface AskInput {
  question: string;
  topic?: Topic | 'any';
  /** Present for follow-up questions in an existing conversation. */
  conversationId?: string;
}

export interface AskResult {
  conversationId: string;
  turn: Turn;
}

export type Feedback = 'helpful' | 'not-helpful';

export interface StarterPrompt {
  topic: Topic;
  label: string;
  question: string;
}
