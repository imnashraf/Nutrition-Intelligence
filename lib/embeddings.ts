import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock generator for when user supplies a Groq key instead of OpenAI
function getMockEmbedding(dimensions: number): number[] {
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.OPENAI_API_KEY?.startsWith('gsk_')) {
    return getMockEmbedding(1536);
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (process.env.OPENAI_API_KEY?.startsWith('gsk_')) {
    return texts.map(() => getMockEmbedding(1536));
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 1536,
    });
    
    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}
