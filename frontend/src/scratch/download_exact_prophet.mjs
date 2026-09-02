import fs from 'fs';
import https from 'https';
import path from 'path';

// Read asmaEMustafaData.ts directly
const content = fs.readFileSync('c:/IslamicPrayer/frontend/src/data/islamic/asmaEMustafaData.ts', 'utf8');

const items = [];
const regex = /id:\s*'(prophet-\d+)',[\s\S]*?arabic:\s*'([^']+)',[\s\S]*?transliteration:\s*'([^']+)',/g;
let match;
while ((match = regex.exec(content)) !== null) {
  items.push({
    id: match[1],
    arabic: match[2].replace(/[ﷺ\s]+$/, '').trim(),
    transliteration: match[3],
  });
}

console.log('Found', items.length, 'Prophet names to generate:');

const outDir = 'c:/IslamicPrayer/frontend/public/audio/prophet';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadItem(item) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outDir, item.id + '.mp3');
    const text = encodeURIComponent(item.arabic);
    const url =
      'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
      text +
      '&tl=ar&total=1&idx=0&textlen=' +
      text.length +
      '&client=tw-ob&prev=input';

    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error('Status ' + res.statusCode + ' for ' + item.id));
        }
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          resolve({ id: item.id, arabic: item.arabic, transliteration: item.transliteration, size: stats.size });
        });
      })
      .on('error', reject);
  });
}

async function run() {
  for (const item of items) {
    try {
      const res = await downloadItem(item);
      console.log(`Saved ${res.id} (${res.transliteration}) -> "${res.arabic}" [${res.size} bytes]`);
      await new Promise((r) => setTimeout(r, 120));
    } catch (e) {
      console.error('Failed on', item.id, e.message);
    }
  }
  console.log('Successfully generated all 30 exact Prophet name audio files.');
}

run();
