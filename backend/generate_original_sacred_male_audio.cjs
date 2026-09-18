const { MPEGDecoder } = require('mpg123-decoder');
const { WaveFile } = require('wavefile');
const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchRawArabicAudio(arabicText) {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(arabicText) + '&tl=ar&total=1&idx=0&textlen=' + arabicText.length + '&client=tw-ob&prev=input';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
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
  // Pitch shift factor (0.75 shifts ~220Hz down to 115-125Hz male baritone chest voice)
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

async function processItem(arabicText, wavPath, mp3Path, decoder) {
  const rawMp3 = await fetchRawArabicAudio(arabicText);
  const decoded = decoder.decode(rawMp3);
  const inSamples = decoded.channelData[0];
  const inSampleRate = decoded.sampleRate;

  const maleSamples = processSamplesToMaleVoice(inSamples, inSampleRate);

  const wav = new WaveFile();
  wav.fromScratch(1, inSampleRate, '16', maleSamples);
  const wavBuf = wav.toBuffer();

  fs.writeFileSync(wavPath, wavBuf);
  fs.writeFileSync(mp3Path, wavBuf);

  const durationSec = (maleSamples.length / inSampleRate).toFixed(2);
  console.log(`[ORIGINAL MALE VOICE] "${arabicText}" | ${durationSec}s | ${wavBuf.length} bytes`);
}

async function run() {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  const allahDir = path.resolve(__dirname, '../frontend/public/audio/allah');
  const prophetDir = path.resolve(__dirname, '../frontend/public/audio/prophet');

  // 1. Allah Ta'ala: "اللهُ جَلَّ جَلَالُه"
  const allahWav = path.join(allahDir, 'allah_taala.wav');
  const allahMp3 = path.join(allahDir, 'allah_taala.mp3');
  await processItem('اللهُ جَلَّ جَلَالُه', allahWav, allahMp3, decoder);

  // 2. Huzur Muhammad ﷺ: "مُحَمَّدٌ رَسُولُ اللّٰهِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّم"
  const prophetWav = path.join(prophetDir, 'huzur_muhammad.wav');
  const prophetMp3 = path.join(prophetDir, 'huzur_muhammad.mp3');
  await processItem('مُحَمَّدٌ رَسُولُ اللّٰهِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّم', prophetWav, prophetMp3, decoder);

  console.log('🎉 Original male voice sacred audio files generated successfully!');
}

run().catch(console.error);
