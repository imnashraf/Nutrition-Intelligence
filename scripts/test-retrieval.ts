import { retrieveChunks } from '../lib/retriever';
import { getChatCompletion } from '../lib/openai';
import 'dotenv/config';

async function testQuery(query: string, label: string) {
  console.log(`\n=== Testing: ${label} ===`);
  console.log(`Query: ${query}`);
  try {
    const chunks = await retrieveChunks(query);
    console.log(`Retrieved ${chunks.length} chunks`);
    for (let i = 0; i < Math.min(2, chunks.length); i++) {
      console.log(`  - Chunk ${i+1}: Score ${chunks[i].similarity.toFixed(3)} - ${chunks[i].documentTitle} (${chunks[i].sectionHeading})`);
    }

    const response = await getChatCompletion([{ role: 'user', content: query }], chunks);
    console.log(`Response: ${response.answer}`);
  } catch (error) {
    console.error(`Error during test:`, error);
  }
}

async function main() {
  await testQuery("Store raw chicken at 4°C (40°F) or below.", "Covered Food Safety Question");
  await testQuery("Eat a balanced diet with plenty of fruits and vegetables.", "Covered Dietary Guidance Question");
  await testQuery("What is the capital of France?", "Unsupported Question");
}

main().catch(console.error);
