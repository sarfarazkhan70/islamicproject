import fs from 'fs';

const djvu = fs.readFileSync('scripts/data/tirmizi_v1_p1_djvu.txt', 'utf8');
console.log('DJVU txt length:', djvu.length);
const pages = djvu.split(/\f|\x0c/);
console.log('DJVU total pages (split by form feed):', pages.length);

for (let i = 0; i < pages.length; i++) {
  const lines = pages[i].trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    // Print first 2 lines and last 2 lines of each page
    const firstLines = lines.slice(0, 3).join(' | ');
    const lastLines = lines.slice(-2).join(' | ');
    if (i < 40 || i % 10 === 0 || i > 330) {
      console.log(`PDF Page ${i+1}: lines=${lines.length} | TOP: ${firstLines.substring(0, 100)} | BTM: ${lastLines.substring(0, 60)}`);
    }
  } else {
    console.log(`PDF Page ${i+1}: EMPTY`);
  }
}
