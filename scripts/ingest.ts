import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { saveDocument, saveChunks } from '../lib/db';
import { generateEmbeddings } from '../lib/embeddings';
import { Pinecone } from '@pinecone-database/pinecone';
import registry from '../corpus/registry.json';
// import pdfParse from 'pdf-parse'; // Uncomment when actual PDFs are introduced

// Simple approximation: 1 token ~= 4 characters for English text
const CHARS_PER_TOKEN = 4;
const MIN_TOKENS = 100;
const MAX_TOKENS = 800;
const OVERLAP_TOKENS = 50;

const MAX_CHARS = MAX_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;
const MIN_CHARS = MIN_TOKENS * CHARS_PER_TOKEN;

const docsDir = path.join(__dirname, '../corpus/documents');

// Helper to chunk text while respecting paragraph boundaries
function chunkText(text: string, maxChars: number, overlapChars: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > maxChars) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      
      // Keep overlap from the end of the current chunk
      const overlapStart = Math.max(0, currentChunk.length - overlapChars);
      const overlapText = currentChunk.substring(overlapStart);
      
      // Find the first space in the overlap text to avoid splitting words
      const safeOverlapStart = overlapText.indexOf(' ');
      currentChunk = (safeOverlapStart >= 0 ? overlapText.substring(safeOverlapStart) : overlapText) + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Function to process a single document text
function processDocument(docMeta: any, rawText: string) {
  // 1. Save document to DB
  const documentRecord = {
    id: docMeta.id,
    title: docMeta.title,
    publisher: docMeta.publisher,
    year: docMeta.year,
    source_url: docMeta.sourceUrl,
    retrieval_date: new Date(docMeta.retrievalDate),
    category: docMeta.category,
    filename: docMeta.filename
  };
  
  // 2. Section detection (rudimentary implementation assuming markdown-style headers)
  // For PDFs, this might involve regex matching common header formats like '1. Introduction', uppercase lines, etc.
  const lines = rawText.split('\n');
  let currentSection = 'General';
  let sectionContent = '';
  const sections: { heading: string, text: string }[] = [];

  for (const line of lines) {
    // Detect heading (e.g., Markdown headers or ALL CAPS short lines)
    if (line.match(/^#+\s+(.*)/)) {
      if (sectionContent.trim()) {
        sections.push({ heading: currentSection, text: sectionContent });
      }
      currentSection = line.replace(/^#+\s+/, '').trim();
      sectionContent = '';
    } else {
      sectionContent += line + '\n';
    }
  }
  
  if (sectionContent.trim()) {
    sections.push({ heading: currentSection, text: sectionContent });
  }

  // 3. Chunking by section
  const dbChunks: any[] = [];
  let globalChunkIndex = 0;

  for (const section of sections) {
    const textChunks = chunkText(section.text, MAX_CHARS, OVERLAP_CHARS);
    
    for (const textChunk of textChunks) {
      if (textChunk.trim().length === 0) continue;
      
      const tokenCount = Math.ceil(textChunk.length / CHARS_PER_TOKEN);
      
      dbChunks.push({
        id: uuidv4(),
        document_id: docMeta.id,
        section_heading: section.heading,
        content: textChunk.trim(),
        chunk_index: globalChunkIndex++,
        token_count: Math.max(MIN_TOKENS, tokenCount),
        embedding_id: null // Will be assigned during embedding phase
      });
    }
  }

  return { documentRecord, dbChunks };
}

async function main() {
  console.log('🚀 Starting ingestion pipeline (with Pinecone)...');
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const pineconeIndex = pc.index(process.env.PINECONE_INDEX || 'nutrition-intelligence');

  let totalDocs = 0;
  let totalChunks = 0;

  for (const doc of registry) {
    const filePath = path.join(docsDir, doc.filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    console.log(`Processing: ${doc.title}...`);
    const rawText = fs.readFileSync(filePath, 'utf-8');
    const { documentRecord, dbChunks } = processDocument(doc, rawText);
    
    try {
      if (dbChunks.length > 0) {
        // 1. Generate embeddings
        const chunkContents = dbChunks.map(c => c.content);
        const embeddings = await generateEmbeddings(chunkContents);
        
        // 2. Map embeddings to chunks and prepare Pinecone vectors
        const vectors = [];
        for (let i = 0; i < dbChunks.length; i++) {
          const chunk = dbChunks[i];
          chunk.embedding_id = chunk.id; // use chunk ID as vector ID
          vectors.push({
            id: chunk.embedding_id,
            values: embeddings[i],
            metadata: {
              documentId: doc.id,
              publisher: doc.publisher,
              year: doc.year,
              category: doc.category
            }
          });
        }

        // 3. Upsert to Pinecone
        await pineconeIndex.upsert({ records: vectors } as any);
      }

      // 4. Save to Postgres
      await saveDocument(documentRecord);
      if (dbChunks.length > 0) {
        await saveChunks(dbChunks);
      }
      
      totalDocs++;
      totalChunks += dbChunks.length;
      console.log(`✅ Saved ${doc.title} with ${dbChunks.length} chunks (and embedded).`);
    } catch (err) {
      console.error(`❌ Error processing ${doc.title}:`, err);
    }
  }

  console.log('🎉 Ingestion complete!');
  console.log(`📊 Documents processed: ${totalDocs}`);
  console.log(`📊 Total chunks embedded & stored: ${totalChunks}`);
  process.exit(0);
}

main().catch(console.error);
