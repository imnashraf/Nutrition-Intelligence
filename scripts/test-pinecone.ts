import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../lib/embeddings';
import 'dotenv/config';

async function main() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX || 'nutrition-intelligence');
  const emb = await generateEmbedding("What is the safe minimum internal temperature for cooking poultry?");
  const res = await index.query({ vector: emb, topK: 5, includeMetadata: true });
  console.log(res.matches.map(m => ({ score: m.score, title: m.metadata?.documentTitle || m.metadata?.documentId })));
}
main().catch(console.error);
