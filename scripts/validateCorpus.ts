import { Pinecone } from '@pinecone-database/pinecone';
import registry from '../corpus/registry.json';
import { getChunksByDocument } from '../lib/db';
import { generateEmbedding } from '../lib/embeddings';

async function main() {
  console.log('🔍 Starting validation checks for Phase 6...');
  
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX || 'nutrition-intelligence');
  
  let passed = 0;
  let totalChecks = 4;

  // Check 1: Registry completeness
  console.log('\n[Check 1] Registry completeness');
  if (registry.length === 22) {
    console.log('✅ Registry has 22 documents.');
    passed++;
  } else {
    console.error('❌ Registry is missing documents.');
  }

  // Check 2: Chunk coverage & Embedding integrity
  console.log('\n[Check 2 & 3] Chunk coverage and Embedding integrity');
  let docsWithChunks = 0;
  let allChunksHaveEmbeddingId = true;
  for (const doc of registry) {
    const chunks = await getChunksByDocument(doc.id);
    if (chunks.length > 0) docsWithChunks++;
    
    for (const chunk of chunks) {
      if (!chunk.embedding_id) allChunksHaveEmbeddingId = false;
    }
  }

  if (docsWithChunks === registry.length) {
    console.log('✅ All documents have chunks.');
    passed++;
  } else {
    console.error('❌ Some documents are missing chunks.');
  }

  if (allChunksHaveEmbeddingId) {
    console.log('✅ All chunks in Postgres have an embedding_id.');
    passed++;
  } else {
    console.error('❌ Some chunks are missing embedding_id in Postgres.');
  }

  // Check 4: Query smoke test
  console.log('\n[Check 4] Query smoke test');
  try {
    const queryEmb = await generateEmbedding('food safety and temperature');
    const results = await index.query({
      vector: queryEmb,
      topK: 1,
      includeMetadata: true
    });
    
    if (results.matches && results.matches.length > 0) {
      console.log('✅ Query smoke test passed. Got match:', results.matches[0].id);
      passed++;
    } else {
      console.error('❌ Query smoke test failed. No matches returned.');
    }
  } catch (err) {
    console.error('❌ Query smoke test error:', err);
  }

  console.log(`\n🎉 Validation complete. Passed ${passed}/${totalChecks} checks.`);
  if (passed === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
