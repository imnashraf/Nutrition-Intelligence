import { config } from 'dotenv';

config({ path: '.env.local' });

async function runTests() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const {
    createConversation,
    saveMessage,
    getMessages,
    saveDocument,
    saveChunks,
    getChunksByDocument
  } = await import('../lib/db');
  
  console.log('🧪 Starting database tests...');

  try {
    // 1. Test Conversations and Messages
    console.log('Testing conversations and messages...');
    const convId = `test-conversation-${Date.now()}`;
    await createConversation(convId);
    console.log('✅ createConversation passed');

    await saveMessage(convId, 'user', 'Hello, this is a test message');
    await saveMessage(convId, 'assistant', 'I received your test message', JSON.stringify([{ claim: "Test", source: null }]));
    console.log('✅ saveMessage passed');

    const messages = await getMessages(convId);
    if (messages.length !== 2) throw new Error('Expected 2 messages');
    console.log('✅ getMessages passed, found 2 messages');

    // 2. Test Documents and Chunks
    console.log('Testing documents and chunks...');
    const docId = `test-doc-${Date.now()}`;


    await saveDocument({
      id: docId,
      title: 'Test Document',
      publisher: 'Test Publisher',
      year: 2026,
      sourceUrl: 'https://example.com/test',
      retrievalDate: '2026-10-01',
      category: 'nutrition',
      filename: 'test.pdf'
    });
    console.log('✅ saveDocument passed');

    const chunks = [
      {
        id: 'chunk-1',
        documentId: docId,
        sectionHeading: 'Introduction',
        content: 'This is the first chunk of the document.',
        chunkIndex: 0,
        tokenCount: 10,
        embeddingId: 'emb-1'
      },
      {
        id: 'chunk-2',
        documentId: docId,
        sectionHeading: 'Conclusion',
        content: 'This is the second chunk of the document.',
        chunkIndex: 1,
        tokenCount: 10,
        embeddingId: null
      }
    ];

    await saveChunks(chunks);
    console.log('✅ saveChunks passed');

    const savedChunks = await getChunksByDocument(docId);
    if (savedChunks.length !== 2) throw new Error('Expected 2 chunks');
    console.log('✅ getChunksByDocument passed, found 2 chunks');

    console.log('🎉 All database tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

runTests();
