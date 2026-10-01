import { retrieveChunks } from '../lib/retriever';

async function main() {
  console.log('Testing cross-document retrieval...');
  const query = 'How should I store raw chicken?';
  const crossDocChunks = await retrieveChunks(query);
  
  console.log(`\nQuery: "${query}"`);
  console.log(`Retrieved ${crossDocChunks.length} chunks.`);
  
  const docCounts: Record<string, number> = {};
  for (let i = 0; i < crossDocChunks.length; i++) {
    const c = crossDocChunks[i];
    docCounts[c.documentId] = (docCounts[c.documentId] || 0) + 1;
    console.log(`\n--- Chunk ${i + 1} (Similarity: ${c.similarity.toFixed(3)}) ---`);
    console.log(`Document: ${c.documentTitle} (${c.publisher}, ${c.year})`);
    console.log(`Section: ${c.sectionHeading}`);
    console.log(`Content snippet: ${c.content.substring(0, 150)}...`);
  }
  
  console.log('\nDocument distribution (should be max 2 per doc):');
  console.log(docCounts);
  
  if (Object.keys(docCounts).length > 0) {
    const sampleDocId = Object.keys(docCounts)[0];
    console.log(`\nTesting single-document retrieval for docId: ${sampleDocId}...`);
    const singleDocChunks = await retrieveChunks(query, { documentId: sampleDocId });
    console.log(`Retrieved ${singleDocChunks.length} chunks (from a single document).`);
    const wrongDocs = singleDocChunks.filter(c => c.documentId !== sampleDocId);
    if (wrongDocs.length > 0) {
      console.error(`ERROR: Single-document retrieval returned chunks from other docs!`);
    } else {
      console.log('✅ Single-document filtering works.');
    }
  }
  
  console.log('\nTesting below-threshold query...');
  const randomQuery = 'Quantum computing interference patterns in 5G networks';
  const randomChunks = await retrieveChunks(randomQuery);
  console.log(`Retrieved ${randomChunks.length} chunks for unrelated query (expected 0).`);
  if (randomChunks.length === 0) {
    console.log('✅ Similarity threshold exclusion works.');
  } else {
    console.warn('⚠️ Returned chunks for unrelated query - similarity threshold might be too low or mock embeddings matched.');
  }

  process.exit(0);
}

main().catch(console.error);
