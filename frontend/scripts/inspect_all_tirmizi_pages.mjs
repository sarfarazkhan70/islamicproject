import fs from 'fs';
import path from 'path';

const rawData = JSON.parse(fs.readFileSync('scripts/data/tirmizi_v1_p1_page_numbers.json', 'utf8'));
console.log('Total pages in json:', rawData.pages.length);

for (let i = 0; i < Math.min(50, rawData.pages.length); i++) {
  const p = rawData.pages[i];
  console.log(`Leaf ${p.leafNum} (PDF ${p.leafNum + 1}): pageNumber="${p.pageNumber}" conf=${p.confidence}`);
}
