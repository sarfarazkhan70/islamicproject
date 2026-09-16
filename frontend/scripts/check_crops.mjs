import fs from 'fs';
import path from 'path';

// Let's inspect the crops or pages
// In Urdu/Arabic books, page numbers are usually at the top right, top center, or top left.
// Let's create a tool to crop top bars of pages 1 to 340 and examine them, or write an OCR/inspection script.

async function run() {
  console.log('Checking sample header crop files...');
  const files = fs.readdirSync('scripts/header_crops').filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));
  console.log('Total header crop files:', files.length);
  console.log('Sample files:', files.slice(0, 15));
}

run();
