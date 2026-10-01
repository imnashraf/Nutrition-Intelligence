import { generateEmbedding } from '../lib/embeddings';

async function main() {
  try {
    const emb = await generateEmbedding('Hello world');
    console.log('Embedding dimension:', emb.length);
  } catch (err) {
    console.error('Embedding failed:', err);
  }
}

main();
