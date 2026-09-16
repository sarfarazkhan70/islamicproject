import fs from 'fs';

const txt = fs.readFileSync('scripts/data/tirmizi_v1_p1_djvu.txt', 'utf8');
const pages = txt.split('\f');
console.log('Total pages in djvu.txt:', pages.length);

pages.forEach((p, idx) => {
  const lines = p.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const first3 = lines.slice(0, 3).join(' | ');
  const last2 = lines.slice(-2).join(' | ');
  
  // Look for Urdu/Arabic digits or numbers in header/footer
  console.log(`Page ${idx + 1}: lines=${lines.length} | top=[${first3.slice(0, 80)}] | btm=[${last2.slice(0, 50)}]`);
});
