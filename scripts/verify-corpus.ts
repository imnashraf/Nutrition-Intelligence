import fs from 'fs';
import path from 'path';
import registry from '../corpus/registry.json';

const docsDir = path.join(__dirname, '../corpus/documents');

console.log('🔍 Verifying corpus...');

let allValid = true;

for (const doc of registry) {
  // Check required metadata
  const requiredKeys = ['id', 'title', 'publisher', 'year', 'sourceUrl', 'retrievalDate', 'filename', 'category'];
  const missingKeys = requiredKeys.filter(key => !(key in doc));

  if (missingKeys.length > 0) {
    console.error(`❌ Document ${doc.id || 'Unknown'} is missing keys: ${missingKeys.join(', ')}`);
    allValid = false;
  }

  // Check file exists
  if (doc.filename) {
    const filePath = path.join(docsDir, doc.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File missing for document ${doc.id}: ${doc.filename}`);
      allValid = false;
    }
  }
}

if (allValid) {
  console.log('✅ All metadata is complete and all files are present in corpus/documents/.');
  console.log(`✅ Total documents registered: ${registry.length}`);
} else {
  console.error('❌ Corpus verification failed.');
  process.exit(1);
}
