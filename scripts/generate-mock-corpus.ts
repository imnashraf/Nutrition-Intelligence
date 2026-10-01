import fs from 'fs';
import path from 'path';
import registry from '../corpus/registry.json';

const docsDir = path.join(__dirname, '../corpus/documents');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

console.log('Generating dummy documents based on registry...');

for (const doc of registry) {
  const filePath = path.join(docsDir, doc.filename);
  
  // Basic mock content so chunking has something to work with
  const content = `
# ${doc.title}

Publisher: ${doc.publisher}
Year: ${doc.year}
Category: ${doc.category}

## 1. Introduction

This is a generated document for ${doc.title}. It provides essential guidance regarding ${doc.category}.
Nutrition and food safety are extremely important.

## 2. Main Guidelines

- Always ensure proper food handling and storage.
- Store raw chicken at 4°C (40°F) or below.
- Eat a balanced diet with plenty of fruits and vegetables.

## 3. Storage and Safety

When storing food, keep raw meats separate from ready-to-eat foods to prevent cross-contamination.
Leftovers should be refrigerated within two hours of cooking.
  `.trim();

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created ${doc.filename}`);
}

console.log('🎉 Corpus generation complete!');
