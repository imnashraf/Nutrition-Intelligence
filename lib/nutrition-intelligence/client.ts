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

const MOCK_LATENCY_MS = 1400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function richTextToPlain(text: RichText): string {
  return text
    .map((node) => {
      if (typeof node === 'string') return node;
      if ('strong' in node) return node.strong;
      return '';
    })
    .join('');
}

import { fetchConversationsAction, fetchConversationAction } from '../actions';

function parseRichText(text: string): RichText {
  const parts = text.split(/\[(\d+)\]/g);
  const result: RichText = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) result.push(parts[i]);
    } else {
      result.push({ cite: parseInt(parts[i], 10) });
    }
  }
  return result;
}

function splitAnswer(text: string, isFoodSafety: boolean) {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [text];
  const shortStr = sentences.slice(0, 1).join('').trim() || text;
  const bodyStr = sentences.slice(1).join('').trim();
  
  const shortAnswer = parseRichText(shortStr);
  const body = bodyStr ? bodyStr.split(/\n+/).filter(Boolean).map(p => parseRichText(p)) : [];
  
  if (isFoodSafety) {
    return { shortAnswer: [], action: shortAnswer, body };
  }
  return { shortAnswer, action: undefined, body };
}

function detectFoodSafety(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('temperature') || lower.includes('safe') || 
         lower.includes('leftover') || lower.includes('food poisoning') ||
         lower.includes('cook to') || lower.includes('refrigerat');
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const summaries = await fetchConversationsAction();
  return summaries.map(s => ({
    id: s.id,
    title: s.title,
    topic: detectFoodSafety(s.title) ? 'food-safety' : 'nutrition',
    updatedAt: s.updatedAt,
    preview: s.preview
  }));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const conv = await fetchConversationAction(id);
  if (!conv) return null;

  const topic = detectFoodSafety(conv.title) ? 'food-safety' : 'nutrition';

  return {
    id: conv.id,
    title: conv.title,
    topic,
    updatedAt: conv.updatedAt,
    turns: conv.turns.map(t => {
      let answer;
      if (t.answer) {
        const { shortAnswer, action, body } = splitAnswer(t.answer.body, topic === 'food-safety');
        const frontendSources = t.answer.sources.map(s => ({
          number: s.number,
          title: s.title,
          authors: s.authors,
          publication: s.publication,
          year: s.year,
          type: s.type,
          url: (s as any).url,
          supports: s.supports
        }));
        
        answer = {
          topic: topic as any,
          shortAnswer,
          action,
          body,
          sources: frontendSources,
          followUps: []
        };
      }
      
      return {
        id: t.id,
        question: t.question,
        askedAt: t.askedAt,
        status: t.status as 'complete' | 'pending' | 'error',
        answer,
        error: undefined
      };
    })
  };
}

export async function askQuestion(input: AskInput): Promise<AskResult> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId: input.conversationId ?? null,
      message: input.question
    })
  });

  if (!res.ok) {
    throw new Error('API request failed');
  }

  const data = await res.json();

  if (data.declined) {
    return {
      conversationId: data.conversationId,
      turn: {
        id: `t-${Date.now()}`,
        question: input.question,
        askedAt: new Date().toISOString(),
        status: 'complete',
        answer: {
          topic: 'nutrition',
          shortAnswer: [{ strong: data.reason }],
          body: [],
          sources: [],
          followUps: []
        }
      }
    };
  }

  const frontendSources = (data.response?.claims || [])
    .filter((c: any) => c.source !== null)
    .map((c: any, i: number) => ({
      number: i + 1,
      title: c.source.documentTitle,
      authors: c.source.publisher,
      publication: c.source.publisher,
      year: c.source.year,
      type: 'Guideline',
      url: c.source.url,
      supports: c.claim
    }));

  const topic = detectFoodSafety(input.question) ? 'food-safety' : 'nutrition';
  const { shortAnswer, action, body } = splitAnswer(data.response?.answer || '', topic === 'food-safety');

  return {
    conversationId: data.conversationId,
    turn: {
      id: `t-${Date.now()}`,
      question: input.question,
      askedAt: new Date().toISOString(),
      status: 'complete',
      answer: {
        topic: topic as any,
        shortAnswer,
        action,
        body,
        sources: frontendSources,
        followUps: []
      }
    },
  };
}

export async function sendFeedback(turnId: string, feedback: Feedback | null): Promise<void> {
  // no-op
}
