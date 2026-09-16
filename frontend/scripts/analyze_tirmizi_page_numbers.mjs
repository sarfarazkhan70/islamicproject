import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In scandata.xml, let's parse every leaf and its pageNumber tag
const xml = fs.readFileSync('scripts/data/tirmizi_v1_p1_scandata.xml', 'utf8');
const pageRegex = /<page\s+leafNum="(\d+)"[^>]*>([\s\S]*?)<\/page>/g;
let match;
const leafMap = {};
while ((match = pageRegex.exec(xml)) !== null) {
  const leafNum = parseInt(match[1], 10);
  const content = match[2];
  const pageNumberMatch = content.match(/<pageNumber>(.*?)<\/pageNumber>/);
  if (pageNumberMatch) {
    leafMap[leafNum] = pageNumberMatch[1];
  }
}

console.log('LeafMap entries count:', Object.keys(leafMap).length);
for (let leaf = 0; leaf < 340; leaf++) {
  const pdfPage = leaf + 1;
  if (leafMap[leaf]) {
    console.log(`PDF Page ${pdfPage} (leaf ${leaf}) => Scandata page: ${leafMap[leaf]}`);
  }
}
