import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { pipeline } from '@xenova/transformers';

class EmbeddingsPipeline {
  static task = 'feature-extraction' as const;
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await EmbeddingsPipeline.getInstance();
    const result = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embedder = await EmbeddingsPipeline.getInstance();
    const result = await embedder(texts, { pooling: 'mean', normalize: true });
    
    // result.data is a flat Float32Array, we need to split it by dimension (384)
    const dimensions = 384;
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      embeddings.push(Array.from(result.data.slice(i * dimensions, (i + 1) * dimensions)));
    }
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}
