import { getChunksByDocument } from '../lib/db';
import registry from '../corpus/registry.json';

async function main() {
  console.log('🔍 Verifying chunks in the database...');
  let totalChunks = 0;
  
  for (const doc of registry) {
    const chunks = await getChunksByDocument(doc.id);
    totalChunks += chunks.length;
    if (chunks.length === 0) {
      console.error(`❌ Missing chunks for document: ${doc.title}`);
    }
  }

  if (totalChunks === 88) {
    console.log(`✅ Success! Found ${totalChunks} chunks in the database.`);
    const sample = await getChunksByDocument(registry[0].id);
    console.log(`\nSample chunk from "${registry[0].title}":`);
    console.log(`Section: ${sample[0].section_heading}`);
    console.log(`Content:\n${sample[0].content}`);
  } else {
    console.error(`❌ Expected 88 chunks, but found ${totalChunks}.`);
  }
  process.exit(0);
}

main().catch(console.error);
