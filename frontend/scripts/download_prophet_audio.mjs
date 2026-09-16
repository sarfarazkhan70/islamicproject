import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('frontend/src/data/islamic/asmaEMustafaData.ts', 'utf8');

// Extract all objects from the file
const regex = /id:\s*'prophet-(\d+)'[\s\S]*?arabic:\s*['"]([^'"]+)['"][\s\S]*?transliteration:\s*['"]([^'"]+)['"]/g;
let match;
const names = [];

while ((match = regex.exec(content)) !== null) {
  const num = parseInt(match[1], 10);
  const rawArabic = match[2];
  const translit = match[3];
  
  // Clean Arabic: remove ﷺ symbol for TTS pronunciation
  const cleanArabic = rawArabic.replace(/ﷺ/g, '').trim();
  names.push({ number: num, arabic: rawArabic, cleanArabic, translit });
}

console.log('Total extracted Prophet names:', names.length);

async function downloadAllProphetAudio() {
  const outDir = 'frontend/public/audio/prophet';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let success = 0;
  for (const item of names) {
    const pad = String(item.number).padStart(2, '0');
    const outFile = path.join(outDir, `prophet-${pad}.mp3`);
    
    // Arabic pronunciation with respectful tashkeel
    const textToSpeak = item.cleanArabic;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=ar&client=tw-ob`;
    
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 200) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(outFile, buf);
        success++;
        console.log(`[${pad}/99] Saved ${outFile} (${buf.length} bytes) - ${item.translit}`);
      } else {
        console.error(`Failed ${pad}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`Error downloading ${pad}:`, e.message);
    }
    
    // Polite delay
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`Finished: ${success} of ${names.length} Prophet MP3 audio files downloaded.`);
}

downloadAllProphetAudio();
