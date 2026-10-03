/**
 * Nutrition Intelligence — data adapter.
 *
 * THE ONLY FILE THAT NEEDS TO CHANGE TO CONNECT YOUR BACKEND.
 *
 * Every screen reads and writes data through the functions below. Right
 * now they return sample data from `mock-data.ts`. Replace each body with
 * a call to your existing API routes / server actions and map the response
 * onto the types in `types.ts`. Component code does not need to change.
 *
 * Note: `getConversation` and `listConversations` are called from Server
 * Components (pages); `askQuestion`, `sendFeedback` and
 * `listConversations` (history panel) are also called from the browser.
 */
import type {
  AskInput,
  AskResult,
  Conversation,
  ConversationSummary,
  Feedback,
  RichText,
} from './types';
import { fetchConversationsAction, fetchConversationAction } from './actions';

export function richTextToPlain(text: RichText): string {
  return text
    .map((node) => {
      if (typeof node === 'string') return node;
      if ('strong' in node) return node.strong;
      return '';
    })
    .join('');
}

export async function listConversations(): Promise<ConversationSummary[]> {
  return fetchConversationsAction();
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return fetchConversationAction(id);
}

export async function askQuestion(input: AskInput): Promise<AskResult> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId: input.conversationId,
      message: input.question,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `API Error: ${res.status}`);
  }

  if (data.declined) {
    return {
      conversationId: data.conversationId || input.conversationId || `draft-${Date.now()}`,
      turn: {
        id: `t-${Date.now()}`,
        question: input.question,
        askedAt: new Date().toISOString(),
        status: 'error',
        error: data.reason || "I cannot fulfill this request.",
      },
    };
  }

  const claims = data.response?.claims || [];
  const sources = claims.map((c: any, i: number) => ({
    number: i + 1,
    title: c.source?.documentTitle || 'Unknown Source',
    authors: 'Unknown',
    publication: 'Unknown',
    year: null,
    type: 'Source',
    supports: c.claim || '',
  }));

  return {
    conversationId: data.conversationId,
    turn: {
      id: `t-${Date.now()}`,
      question: input.question,
      askedAt: new Date().toISOString(),
      status: 'complete',
      answer: {
        topic: 'nutrition',
        shortAnswer: [{ strong: "Answer:" }],
        body: [[data.response?.answer || '']],
        sources: sources,
        followUps: [],
      },
    },
  };
}

export async function sendFeedback(turnId: string, feedback: Feedback | null): Promise<void> {
  // no-op with real data for now
}
