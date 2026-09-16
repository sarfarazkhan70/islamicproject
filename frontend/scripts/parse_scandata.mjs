import fs from 'fs';

const xml = fs.readFileSync('scripts/data/tirmizi_v1_p1_scandata.xml', 'utf8');
console.log('XML length:', xml.length);

// Extract all page elements and pageNumber if present
const pageMatches = [...xml.matchAll(/<page\s+leafNum="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)];
console.log('Total page tags found:', pageMatches.length);

for (const m of pageMatches) {
  const leafNum = parseInt(m[1]);
  const pageXml = m[2];
  const pageNumMatch = pageXml.match(/<pageNumber>([^<]*)<\/pageNumber>/);
  const pageTypeMatch = pageXml.match(/<pageType>([^<]*)<\/pageType>/);
  const pageNumber = pageNumMatch ? pageNumMatch[1] : '';
  const pageType = pageTypeMatch ? pageTypeMatch[1] : '';
  if (pageNumber || pageType || leafNum < 15 || leafNum > 330) {
    console.log(`Leaf ${leafNum} (PDF ${leafNum + 1}): pageType="${pageType}", pageNumber="${pageNumber}"`);
  }
}
