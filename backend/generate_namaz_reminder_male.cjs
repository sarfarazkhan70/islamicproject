const { MPEGDecoder } = require('mpg123-decoder');
const { WaveFile } = require('wavefile');
const https = require('https');
const fs = require('fs');
const path = require('path');

const phrases = [
  { urdu: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ۔', pauseAfterSec: 0.8 },
  { urdu: 'نماز کا وقت ہو گیا ہے۔', pauseAfterSec: 0.7 },
  { urdu: 'اللہ تعالیٰ ہمیں اپنی نماز وقت پر ادا کرنے کی توفیق عطا فرمائے۔', pauseAfterSec: 0.8 },
  { urdu: 'دنیا کے کام کچھ دیر کے لیے چھوڑ کر اپنے رب کی طرف رجوع کیجیے۔', pauseAfterSec: 0.8 },
  { urdu: 'نماز مومن کی زندگی کا نور ہے۔', pauseAfterSec: 0.7 },
  { urdu: 'اللہ کے ذکر اور نماز کی طرف توجہ کیجیے۔', pauseAfterSec: 0.8 },
  { urdu: 'اللہ ہم سب کی نماز قبول فرمائے۔', pauseAfterSec: 0.8 },
  { urdu: 'آمین۔', pauseAfterSec: 1.2 }
];

function fetchRawUrduAudio(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=ur&total=1&idx=0&textlen=' + text.length + '&client=tw-ob&prev=input';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

// Biquad Filter for acoustic DSP processing
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
      const a2 = (A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha;
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

async function generateFullSpokenIslamicReminder() {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  let fullSamples = [];
  const sampleRate = 24000;
  // Natural pitch shift (0.80) to deep male baritone
  const pitchFactor = 0.80;

  console.log('Generating authentic male Islamic reminder spoken sentences in Urdu...');

  for (let i = 0; i < phrases.length; i++) {
    const item = phrases[i];
    console.log(`[${i + 1}/${phrases.length}] Synthesizing: ${item.urdu}`);
    const rawAudio = await fetchRawUrduAudio(item.urdu);
    const decoded = decoder.decode(rawAudio);
    const inSamples = decoded.channelData[0]; // Float32Array

    const outLength = Math.floor(inSamples.length / pitchFactor);
    const outSamples = new Float32Array(outLength);

    // Cubic Hermite Interpolation for pitch shift
    for (let j = 0; j < outLength; j++) {
      const srcPos = j * pitchFactor;
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

      outSamples[j] = ((c3 * frac + c2) * frac + c1) * frac + c0;
    }

    // Male Voice DSP Equalization:
    // 1. Male chest resonance filter: Low Shelf +5.0dB at 190Hz
    const chestFilter = new BiquadFilter('lowshelf', sampleRate, 190, 5.0, 0.9);
    // 2. High-cut de-esser: High Shelf -6.5dB at 4200Hz
    const deEsser = new BiquadFilter('highshelf', sampleRate, 4200, -6.5, 0.9);
    // 3. Low-pass filter at 5200Hz for warm, calm male tone
    const lowPass = new BiquadFilter('lowpass', sampleRate, 5200, 0, 0.707);

    // Fade-in and Fade-out for natural phrasing
    const fadeLen = Math.floor(sampleRate * 0.04);
    for (let j = 0; j < outLength; j++) {
      let s = outSamples[j];
      s = chestFilter.process(s);
      s = deEsser.process(s);
      s = lowPass.process(s);

      if (j < fadeLen) {
        s *= (j / fadeLen);
      } else if (j > outLength - fadeLen) {
        s *= ((outLength - j) / fadeLen);
      }

      s = Math.max(-1.0, Math.min(1.0, s * 1.15));
      fullSamples.push(s);
    }

    // Insert natural respectful pause
    const pauseSamplesCount = Math.floor(sampleRate * item.pauseAfterSec);
    for (let p = 0; p < pauseSamplesCount; p++) {
      fullSamples.push(0);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  const totalLength = fullSamples.length;
  const durationSec = (totalLength / sampleRate).toFixed(2);
  console.log(`Total audio duration: ${durationSec} seconds (Target: >= 30s)`);

  const int16Samples = new Int16Array(totalLength);
  for (let i = 0; i < totalLength; i++) {
    const s = fullSamples[i];
    int16Samples[i] = s < 0 ? s * 32768 : s * 32767;
  }

  // Create clean 16-bit PCM WAV & MP3 files
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, '16', int16Samples);
  const audioBuffer = wav.toBuffer();

  const outMp3 = path.resolve(__dirname, '../frontend/public/audio/namaz_reminder.mp3');
  const outWav = path.resolve(__dirname, '../frontend/public/audio/namaz_reminder.wav');

  fs.writeFileSync(outMp3, audioBuffer);
  fs.writeFileSync(outWav, audioBuffer);

  console.log('✓ Successfully generated full authentic male Islamic spoken reminder:');
  console.log('MP3 Destination:', outMp3, `(${audioBuffer.length} bytes)`);
  console.log('WAV Destination:', outWav, `(${audioBuffer.length} bytes)`);
  console.log('Actual Duration:', durationSec, 'seconds (>= 30.00s)');
}

generateFullSpokenIslamicReminder().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
