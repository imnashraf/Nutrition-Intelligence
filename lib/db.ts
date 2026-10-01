import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isMigrated = false;

async function migrate() {
  if (isMigrated) return;
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
      }
    }
    isMigrated = true;
  } catch (err) {
    console.error('Migration failed', err);
    throw err;
  } finally {
    client.release();
  }
}

export async function createConversation(id: string): Promise<void> {
  await migrate();
  const query = 'INSERT INTO conversations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING';
  await pool.query(query, [id]);
}

export async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  claimsJson?: string
): Promise<void> {
  await migrate();
  const query = `
    INSERT INTO messages (conversation_id, role, content, claims_json)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [conversationId, role, content, claimsJson || null]);
}

export async function getMessages(conversationId: string): Promise<any[]> {
  await migrate();
  const query = 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY id ASC';
  const { rows } = await pool.query(query, [conversationId]);
  return rows;
}

export async function saveDocument(doc: any): Promise<void> {
  await migrate();
  const query = `
    INSERT INTO documents (id, title, publisher, year, source_url, retrieval_date, category, filename)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      publisher = EXCLUDED.publisher,
      year = EXCLUDED.year,
      source_url = EXCLUDED.source_url,
      retrieval_date = EXCLUDED.retrieval_date,
      category = EXCLUDED.category,
      filename = EXCLUDED.filename
  `;
  await pool.query(query, [
    doc.id,
    doc.title,
    doc.publisher,
    doc.year,
    doc.source_url || doc.sourceUrl,
    doc.retrieval_date || doc.retrievalDate,
    doc.category,
    doc.filename,
  ]);
}

export async function saveChunks(chunks: any[]): Promise<void> {
  await migrate();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const query = `
      INSERT INTO chunks (id, document_id, section_heading, content, chunk_index, token_count, embedding_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        document_id = EXCLUDED.document_id,
        section_heading = EXCLUDED.section_heading,
        content = EXCLUDED.content,
        chunk_index = EXCLUDED.chunk_index,
        token_count = EXCLUDED.token_count,
        embedding_id = EXCLUDED.embedding_id
    `;
    
    for (const chunk of chunks) {
      await client.query(query, [
        chunk.id,
        chunk.document_id ?? chunk.documentId,
        chunk.section_heading ?? chunk.sectionHeading,
        chunk.content,
        chunk.chunk_index ?? chunk.chunkIndex,
        chunk.token_count ?? chunk.tokenCount,
        chunk.embedding_id ?? chunk.embeddingId ?? null,
      ]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getChunksByDocument(documentId: string): Promise<any[]> {
  await migrate();
  const query = 'SELECT * FROM chunks WHERE document_id = $1 ORDER BY chunk_index ASC';
  const { rows } = await pool.query(query, [documentId]);
  return rows;
}
