const fs = require('fs');
const path = require('path');
const https = require('https');
const { WaveFile } = require('wavefile');
const { MPEGDecoder } = require('mpg123-decoder');

function fetchAudio(text, lang) {
  return new Promise((resolve, reject) => {
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
  // Pitch shift factor (0.75 shifts down to authentic male baritone chest voice)
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

async function generateSacredAudio(item, decoder) {
  console.log(`Generating male audio for ${item.name}...`);

  // 1. Fetch Arabic name, Urdu meaning, English meaning
  const arBuf = await fetchAudio(item.arabicText, 'ar');
  await new Promise(r => setTimeout(r, 100));

  const urBuf = await fetchAudio(item.urduText, 'ur');
  await new Promise(r => setTimeout(r, 100));

  const enBuf = await fetchAudio(item.englishText, 'en');

  // 2. Decode to PCM Float32
  const arDecoded = decoder.decode(arBuf);
  const urDecoded = decoder.decode(urBuf);
  const enDecoded = decoder.decode(enBuf);

  // 3. Apply exact male voice DSP filter chain
  const arSamples = processSamplesToMaleVoice(arDecoded.channelData[0], arDecoded.sampleRate);
  const urSamples = processSamplesToMaleVoice(urDecoded.channelData[0], urDecoded.sampleRate);
  const enSamples = processSamplesToMaleVoice(enDecoded.channelData[0], enDecoded.sampleRate);

  // 450ms natural pause (10800 samples at 24kHz)
  const pauseSamples = new Int16Array(10800);

  // Concatenate: [Arabic] -> Pause -> [Urdu] -> Pause -> [English]
  const totalLength = arSamples.length + pauseSamples.length + urSamples.length + pauseSamples.length + enSamples.length;
  const combined = new Int16Array(totalLength);

  let offset = 0;
  combined.set(arSamples, offset); offset += arSamples.length;
  combined.set(pauseSamples, offset); offset += pauseSamples.length;
  combined.set(urSamples, offset); offset += urSamples.length;
  combined.set(pauseSamples, offset); offset += pauseSamples.length;
  combined.set(enSamples, offset);

  // 4. Write standard 16-bit PCM WAV file
  const wav = new WaveFile();
  wav.fromScratch(1, 24000, '16', combined);
  const wavBuf = wav.toBuffer();

  fs.writeFileSync(item.wavPath, wavBuf);
  // Also write to mp3 path for fallback/compatibility
  fs.writeFileSync(item.mp3Path, wavBuf);

  const durationSec = (totalLength / 24000).toFixed(2);
  console.log(`✅ [${item.name}] Generated: Arabic (${(arSamples.length/24000).toFixed(1)}s) -> Urdu (${(urSamples.length/24000).toFixed(1)}s) -> English (${(enSamples.length/24000).toFixed(1)}s) | Total: ${durationSec}s | Size: ${wavBuf.length} bytes`);
}

async function run() {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  const items = [
    {
      name: "Allah Ta'ala",
      arabicText: 'اللهُ جَلَّ جَلَالُه',
      urduText: 'اللہ تعالیٰ۔ اللہ تعالیٰ سب سے بلند اور عظیم ہے۔',
      englishText: 'Allah Ta\'ala. Allah, Glorious and Exalted is He.',
      wavPath: path.resolve(__dirname, '../frontend/public/audio/allah/allah_taala.wav'),
      mp3Path: path.resolve(__dirname, '../frontend/public/audio/allah/allah_taala.mp3'),
    },
    {
      name: 'Huzur Muhammad ﷺ',
      arabicText: 'مُحَمَّدٌ رَسُولُ اللّٰهِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّم',
      urduText: 'حضور محمد مصطفیٰ صلی اللہ علیہ وسلم۔ حضور محمد مصطفیٰ صلی اللہ علیہ وسلم اللہ کے آخری نبی اور رسول ہیں۔',
      englishText: 'Huzur Muhammad, peace and blessings be upon him. Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah.',
      wavPath: path.resolve(__dirname, '../frontend/public/audio/prophet/huzur_muhammad.wav'),
      mp3Path: path.resolve(__dirname, '../frontend/public/audio/prophet/huzur_muhammad.mp3'),
    },
  ];

  for (const item of items) {
    await generateSacredAudio(item, decoder);
  }

  console.log('\n🎉 Both sacred audio files generated with authentic male voice pipeline!');
}

run().catch(console.error);
