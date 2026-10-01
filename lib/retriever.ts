import { Pinecone } from '@pinecone-database/pinecone';
import { Pool } from 'pg';
import { generateEmbedding } from './embeddings';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  publisher: string;
  year: number;
  url: string;
  sectionHeading: string;
  content: string;
  similarity: number;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SIMILARITY_THRESHOLD = 0.72;

export async function retrieveChunks(
  query: string,
  options?: { documentId?: string; topK?: number }
): Promise<RetrievedChunk[]> {
  const topK = options?.topK ?? 8;
  const isSingleDoc = !!options?.documentId;
  
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Query Pinecone
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX || 'nutrition-intelligence');
  
  // To have enough chunks for deduplication, we fetch more if cross-doc
  const fetchK = isSingleDoc ? topK : topK * 3;
  
  const queryRequest: any = {
    vector: queryEmbedding,
    topK: fetchK,
    includeMetadata: true,
  };
  
  if (isSingleDoc) {
    queryRequest.filter = { documentId: options!.documentId };
  }
  
  const queryResponse = await index.query(queryRequest);
  
  // 3. Filter by threshold
  let matches = queryResponse.matches.filter(
    (match) => match.score !== undefined && match.score >= SIMILARITY_THRESHOLD
  );
  
  // 4. Deduplicate (max 2 per document if cross-doc)
  if (!isSingleDoc) {
    const docCounts: Record<string, number> = {};
    const deduplicated = [];
    
    for (const match of matches) {
      const docId = match.metadata?.documentId as string;
      if (!docId) continue;
      
      docCounts[docId] = (docCounts[docId] || 0) + 1;
      if (docCounts[docId] <= 2) {
        deduplicated.push(match);
      }
      
      if (deduplicated.length >= topK) {
        break;
      }
    }
    matches = deduplicated.slice(0, topK);
  } else {
    matches = matches.slice(0, topK);
  }
  
  if (matches.length === 0) {
    return [];
  }
  
  // 5. Fetch full data from Postgres
  const chunkIds = matches.map((m) => m.id);
  
  // Ensure the query returns results in the same order as chunkIds (by score)
  // We can do this in memory by mapping after fetch
  const pgQuery = `
    SELECT 
      c.id, c.document_id, c.section_heading, c.content,
      d.title, d.publisher, d.year, d.source_url
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    WHERE c.id = ANY($1)
  `;
  
  const { rows } = await pool.query(pgQuery, [chunkIds]);
  
  const chunksMap = new Map<string, any>();
  for (const row of rows) {
    chunksMap.set(row.id, row);
  }
  
  const retrievedChunks: RetrievedChunk[] = [];
  
  for (const match of matches) {
    const row = chunksMap.get(match.id);
    if (row) {
      retrievedChunks.push({
        id: row.id,
        documentId: row.document_id,
        documentTitle: row.title,
        publisher: row.publisher,
        year: row.year,
        url: row.source_url,
        sectionHeading: row.section_heading,
        content: row.content,
        similarity: match.score!,
      });
    }
  }
  
  return retrievedChunks;
}
