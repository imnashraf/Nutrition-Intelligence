import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pinecone } from '@pinecone-database/pinecone';

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || 'nutrition-intelligence';

  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is missing');
  }

  const pc = new Pinecone({ apiKey });
  
  console.log(`Checking if index "${indexName}" exists...`);
  const { indexes } = await pc.listIndexes();
  const exists = indexes?.some(idx => idx.name === indexName);
  
  if (exists) {
    console.log(`🧹 Clearing existing index "${indexName}" vectors...`);
    const index = pc.index(indexName);
    await index.deleteAll();
    console.log(`✅ Index "${indexName}" cleared.`);
    return;
  }

  console.log(`⏳ Creating index "${indexName}"... This may take a moment.`);
    await pc.createIndex({
      name: indexName,
      dimension: 384, // Xenova/all-MiniLM-L6-v2 dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    console.log(`✅ Index "${indexName}" created successfully!`);
}

main().catch(err => {
  console.error('Error setting up Pinecone:', err);
  process.exit(1);
});
