"use server";

import { Pool } from 'pg';
import { getMessages } from '../db';
import { Conversation, Turn, ConversationSummary, RichText, Answer, Source } from './types';

// We need our own pool or reuse the one in db.ts if it was exported.
// Since it's not exported, we can just do raw queries or export them.
// Let's import from db.ts and add new db functions if needed.
// Actually, let's just create a new pool instance here to be safe and simple, or require it.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchConversationsAction(): Promise<ConversationSummary[]> {
  const query = `
    SELECT id, created_at
    FROM conversations
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  
  const summaries: ConversationSummary[] = [];
  for (const row of rows) {
    // Get the first user message for title, or preview
    const msgs = await getMessages(row.id);
    const userMsg = msgs.find(m => m.role === 'user');
    summaries.push({
      id: row.id,
      title: userMsg ? userMsg.content.substring(0, 50) + '...' : 'New Conversation',
      topic: 'nutrition',
      updatedAt: row.created_at.toISOString(),
      preview: '...',
    });
  }
  return summaries;
}

export async function fetchConversationAction(id: string): Promise<Conversation | null> {
  const query = `SELECT id, created_at FROM conversations WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  if (rows.length === 0) return null;

  const msgs = await getMessages(id);
  const turns: Turn[] = [];
  
  // Group messages into turns (user followed by assistant)
  let currentTurn: Partial<Turn> | null = null;
  
  for (const msg of msgs) {
    if (msg.role === 'user') {
      if (currentTurn) {
        turns.push(currentTurn as Turn);
      }
      currentTurn = {
        id: `t-${msg.id}`,
        question: msg.content,
        askedAt: msg.created_at.toISOString(),
        status: 'complete',
      };
    } else if (msg.role === 'assistant' && currentTurn) {
      let claims = [];
      try {
        if (msg.claims_json) claims = JSON.parse(msg.claims_json);
      } catch (e) {}

      const sources: Source[] = claims.map((c: any, i: number) => ({
        number: i + 1,
        title: c.source?.documentTitle || 'Unknown Source',
        authors: 'Unknown',
        publication: 'Unknown',
        year: null,
        type: 'Source',
        supports: c.claim || ''
      }));

      currentTurn.answer = {
        topic: 'nutrition',
        shortAnswer: [{ strong: "Answer" }],
        body: [[msg.content]],
        sources: sources,
        followUps: [],
      };
    }
  }
  
  if (currentTurn) {
    turns.push(currentTurn as Turn);
  }

  return {
    id: rows[0].id,
    title: turns[0]?.question.substring(0, 50) || 'New Conversation',
    topic: 'nutrition',
    updatedAt: rows[0].created_at.toISOString(),
    turns,
  };
}
