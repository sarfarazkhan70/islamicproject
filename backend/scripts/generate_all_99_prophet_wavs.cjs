const { MPEGDecoder } = require('mpg123-decoder');
const { WaveFile } = require('wavefile');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Extract all 99 items directly from asmaEMustafaData.ts to ensure 100% exact text matching
const dataFile = path.resolve(__dirname, '../../frontend/src/data/islamic/asmaEMustafaData.ts');
let code = fs.readFileSync(dataFile, 'utf8');
code = code.replace(/import\s+[^;]+;/g, '');
code = code.replace(/export\s+const\s+ASMA_E_MUSTAFA\s*:\s*IslamicNameItem\[\]\s*=\s*/, 'const ASMA_E_MUSTAFA = ');
code += '\nmodule.exports = ASMA_E_MUSTAFA;';

const tempCjs = path.resolve(__dirname, 'temp_asma_data.cjs');
fs.writeFileSync(tempCjs, code);
const names = require(tempCjs);
fs.unlinkSync(tempCjs);

console.log(`Loaded all ${names.length} Asma-e-Mustafa entries directly from source data.`);

function fetchAudio(text, lang) {
  return new Promise((resolve, reject) => {
    // Sanitize text if needed (remove trailing ﷺ for TTS clarity)
    const cleanText = text.replace(/[ﷺ\s]+$/, '').trim();
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(cleanText) + '&tl=' + lang + '&total=1&idx=0&textlen=' + cleanText.length + '&client=tw-ob&prev=input';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for lang=${lang}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

class BiquadFilter {
  constructor(type, sampleRate, freq, gainDb = 0, q = 1.0) {
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const A = Math.pow(10, gainDb / 40);
    const alpha = sinw0 / (2 * q);

    if (type === 'lowshelf') {
      const b0 = A * ((A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha);
      const b1 = 2 * A * ((A - 1) - (A + 1) * cosw0);
      const b2 = A * ((A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha);
      const a0 = (A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha;
      const a1 = -2 * ((A - 1) + (A + 1) * cosw0);
      const a2 = (A + 1) + (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha;
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
      this.a1 = a1 / a0; this.a2 = a2 / a0;
    } else if (type === 'highshelf') {
      const b0 = A * ((A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha);
      const b1 = -2 * A * ((A - 1) + (A + 1) * cosw0);
      const b2 = A * ((A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha);
      const a0 = (A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha;
      const a1 = 2 * ((A - 1) - (A + 1) * cosw0);
      const a2 = (A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha;
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
      this.a1 = a1 / a0; this.a2 = a2 / a0;
    } else { // lowpass
      const b0 = (1 - cosw0) / 2;
      const b1 = 1 - cosw0;
      const b2 = (1 - cosw0) / 2;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw0;
      const a2 = 1 - alpha;
      this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
      this.a1 = a1 / a0; this.a2 = a2 / a0;
    }
  }

  process(sample) {
    const out = this.b0 * sample + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = sample;
    this.y2 = this.y1; this.y1 = out;
    return out;
  }
}

function processSamplesToMaleVoice(inSamples, inSampleRate) {
  // Pitch shift factor (0.75 shifts ~220Hz down to 115-125Hz authentic male baritone chest voice)
  const pitchFactor = 0.75;
  const outLength = Math.floor(inSamples.length / pitchFactor);
  const outSamples = new Float32Array(outLength);

  // Cubic Hermite Interpolation for pitch shift
  for (let i = 0; i < outLength; i++) {
    const srcPos = i * pitchFactor;
    const idx = Math.floor(srcPos);
    const frac = srcPos - idx;

    const p0 = inSamples[Math.max(0, idx - 1)] || 0;
    const p1 = inSamples[idx] || 0;
    const p2 = inSamples[Math.min(inSamples.length - 1, idx + 1)] || 0;
    const p3 = inSamples[Math.min(inSamples.length - 1, idx + 2)] || 0;

    const c0 = p1;
    const c1 = 0.5 * (p2 - p0);
    const c2 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
    const c3 = 0.5 * (p3 - p0) + 1.5 * (p1 - p2);

    outSamples[i] = ((c3 * frac + c2) * frac + c1) * frac + c0;
  }

  // Male Voice DSP Equalization Filters:
  const chestFilter = new BiquadFilter('lowshelf', inSampleRate, 220, 4.5, 0.9);
  const deEsser = new BiquadFilter('highshelf', inSampleRate, 4500, -6.0, 0.9);
  const lowPass = new BiquadFilter('lowpass', inSampleRate, 5500, 0, 0.707);

  const int16Samples = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    let s = outSamples[i];
    s = chestFilter.process(s);
    s = deEsser.process(s);
    s = lowPass.process(s);
    s = Math.max(-1.0, Math.min(1.0, s * 1.15));
    int16Samples[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return int16Samples;
}

async function processItem(item, decoder, outDir) {
  // 1. Arabic: [Name] + Sallallahu Alaihi Wasallam
  const cleanArabicName = item.arabic.replace(/[ﷺ\s]+$/, '').trim();
  const fullArabicText = cleanArabicName + ' صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّم';
  
  // 2. Urdu displayed translation
  const urduText = item.urdu.trim();

  // 3. English displayed translation (strip any slashes for speech clarity)
  const englishText = item.english.replace(/\//g, ',').trim();

  // Fetch all 3 audio streams
  const arBuf = await fetchAudio(fullArabicText, 'ar');
  await new Promise(r => setTimeout(r, 60));
  const urBuf = await fetchAudio(urduText, 'ur');
  await new Promise(r => setTimeout(r, 60));
  const enBuf = await fetchAudio(englishText, 'en');

  // Decode to PCM Float32 samples
  const arDecoded = decoder.decode(arBuf);
  const urDecoded = decoder.decode(urBuf);
  const enDecoded = decoder.decode(enBuf);

  // Apply male reciter DSP filter chain
  const arSamples = processSamplesToMaleVoice(arDecoded.channelData[0], arDecoded.sampleRate);
  const urSamples = processSamplesToMaleVoice(urDecoded.channelData[0], urDecoded.sampleRate);
  const enSamples = processSamplesToMaleVoice(enDecoded.channelData[0], enDecoded.sampleRate);

  // 450ms natural pause (10800 samples at 24kHz)
  const pauseSamples = new Int16Array(10800);

  // Concatenate: [Arabic + SAW] -> Pause -> [Urdu] -> Pause -> [English]
  const totalLength = arSamples.length + pauseSamples.length + urSamples.length + pauseSamples.length + enSamples.length;
  const combined = new Int16Array(totalLength);

  let offset = 0;
  combined.set(arSamples, offset); offset += arSamples.length;
  combined.set(pauseSamples, offset); offset += pauseSamples.length;
  combined.set(urSamples, offset); offset += urSamples.length;
  combined.set(pauseSamples, offset); offset += pauseSamples.length;
  combined.set(enSamples, offset);

  // Write standard 16-bit PCM WAV file
  const wav = new WaveFile();
  wav.fromScratch(1, 24000, '16', combined);
  const wavBuf = wav.toBuffer();

  const outFile = path.join(outDir, `${item.id}.wav`);
  fs.writeFileSync(outFile, wavBuf);

  const durationSec = (totalLength / 24000).toFixed(2);
  console.log(`[PASS #${item.number} ${item.id}] Audio: Name+SAW (${(arSamples.length/24000).toFixed(1)}s) -> Urdu (${(urSamples.length/24000).toFixed(1)}s) -> English (${(enSamples.length/24000).toFixed(1)}s) | Total: ${durationSec}s | ${wavBuf.length} bytes`);
}

async function run() {
  const outDir = path.resolve(__dirname, '../../frontend/public/audio/prophet');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const decoder = new MPEGDecoder();
  await decoder.ready;

  console.log(`Generating all ${names.length} multilingual Asma-e-Mustafa WAV audio files (Name + SAW + Urdu + English)...`);
  for (const item of names) {
    let retries = 3;
    while (retries > 0) {
      try {
        await processItem(item, decoder, outDir);
        break;
      } catch (err) {
        retries--;
        console.error(`Error on ${item.id} (#${item.number}), remaining retries: ${retries}`, err.message);
        await new Promise(r => setTimeout(r, 1200));
        if (retries === 0) throw err;
      }
    }
    await new Promise(r => setTimeout(r, 120));
  }
  console.log(`\n🎉 All ${names.length} multilingual Asma-e-Mustafa audio files generated successfully!`);
}

run().catch(console.error);
