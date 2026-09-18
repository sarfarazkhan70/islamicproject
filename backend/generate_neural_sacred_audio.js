import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { MPEGDecoder } from 'mpg123-decoder';
import wavePkg from 'wavefile';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { WaveFile } = wavePkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchSegmentAudio(text, voice) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  
  const { audioStream } = tts.toStream(text);
  const chunks = [];
  audioStream.on('data', chunk => chunks.push(chunk));
  
  await new Promise((resolve, reject) => {
    audioStream.on('end', resolve);
    audioStream.on('error', reject);
  });
  
  return Buffer.concat(chunks);
}

async function buildCardAudio(card, decoder) {
  console.log(`\n======================================================`);
  console.log(`Generating AI Male Voice Audio for: ${card.title}`);
  console.log(`======================================================`);

  const pcmSegments = [];
  const rawMp3Segments = [];

  for (let i = 0; i < card.sections.length; i++) {
    const sec = card.sections[i];
    console.log(`  [Segment ${i + 1}/${card.sections.length}] Voice: ${sec.voice}`);
    console.log(`     Text: "${sec.text}"`);

    const mp3Buf = await fetchSegmentAudio(sec.text, sec.voice);
    rawMp3Segments.push(mp3Buf);

    const decoded = decoder.decode(mp3Buf);
    const floatSamples = decoded.channelData[0];
    const sampleRate = decoded.sampleRate;

    // Convert Float32 [-1.0, 1.0] to Int16
    const int16Samples = new Int16Array(floatSamples.length);
    for (let j = 0; j < floatSamples.length; j++) {
      const s = Math.max(-1.0, Math.min(1.0, floatSamples[j]));
      int16Samples[j] = s < 0 ? s * 32768 : s * 32767;
    }

    pcmSegments.push({ samples: int16Samples, sampleRate });
    console.log(`     -> Duration: ${(int16Samples.length / sampleRate).toFixed(2)}s (${mp3Buf.length} bytes MP3)`);
  }

  // 450ms pause between sections at 24kHz (10800 samples)
  const sampleRate = 24000;
  const pauseSamples = new Int16Array(Math.floor(sampleRate * 0.45));

  let totalSamples = 0;
  for (let i = 0; i < pcmSegments.length; i++) {
    totalSamples += pcmSegments[i].samples.length;
    if (i < pcmSegments.length - 1) {
      totalSamples += pauseSamples.length;
    }
  }

  const combined = new Int16Array(totalSamples);
  let offset = 0;
  for (let i = 0; i < pcmSegments.length; i++) {
    combined.set(pcmSegments[i].samples, offset);
    offset += pcmSegments[i].samples.length;
    if (i < pcmSegments.length - 1) {
      combined.set(pauseSamples, offset);
      offset += pauseSamples.length;
    }
  }

  // 1. Write pristine 16-bit 24kHz PCM WAV
  const wav = new WaveFile();
  wav.fromScratch(1, sampleRate, '16', combined);
  const wavBuf = wav.toBuffer();
  fs.writeFileSync(card.wavPath, wavBuf);
  console.log(`\n  ✅ Saved Master WAV: ${card.wavPath} (${wavBuf.length} bytes, ${(totalSamples / sampleRate).toFixed(2)}s)`);

  // 2. Concatenate raw MP3 chunks for compliant MP3 stream
  const combinedMp3 = Buffer.concat(rawMp3Segments);
  fs.writeFileSync(card.mp3Path, combinedMp3);
  console.log(`  ✅ Saved Master MP3: ${card.mp3Path} (${combinedMp3.length} bytes)`);
  
  return { duration: totalSamples / sampleRate };
}

async function main() {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  const cards = [
    {
      title: "Allah Ta'ala (الله جل جلاله)",
      wavPath: path.resolve(__dirname, '../frontend/public/audio/allah/allah_taala.wav'),
      mp3Path: path.resolve(__dirname, '../frontend/public/audio/allah/allah_taala.mp3'),
      sections: [
        {
          voice: 'ar-SA-HamedNeural',
          text: 'اللّٰهُ جَلَّ جَلَالُه',
        },
        {
          voice: 'ur-PK-AsadNeural',
          text: 'اللہ جل جلالہ۔ اللہ تعالیٰ۔ اللہ تعالیٰ سب سے بلند اور عظیم ہے۔',
        },
        {
          voice: 'en-US-AndrewMultilingualNeural',
          text: 'Allah, Glorious and Exalted is He.',
        },
      ],
    },
    {
      title: "Huzur Muhammad ﷺ (محمد رسول الله صلى الله عليه وسلم)",
      wavPath: path.resolve(__dirname, '../frontend/public/audio/prophet/huzur_muhammad.wav'),
      mp3Path: path.resolve(__dirname, '../frontend/public/audio/prophet/huzur_muhammad.mp3'),
      sections: [
        {
          voice: 'ar-SA-HamedNeural',
          text: 'مُحَمَّدٌ رَسُولُ اللّٰهِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّم',
        },
        {
          voice: 'ur-PK-AsadNeural',
          text: 'محمد رسول اللہ صلی اللہ علیہ وسلم۔ حضور محمد مصطفیٰ صلی اللہ علیہ وسلم۔ حضور محمد مصطفیٰ صلی اللہ علیہ وسلم اللہ کے آخری نبی اور رسول ہیں۔',
        },
        {
          voice: 'en-US-AndrewMultilingualNeural',
          text: 'Muhammad, the Messenger of Allah, peace and blessings be upon him. Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah.',
        },
      ],
    },
  ];

  for (const card of cards) {
    const res = await buildCardAudio(card, decoder);
    console.log(`  🎯 Verified Duration for ${card.title}: ${res.duration.toFixed(2)} seconds\n`);
  }

  console.log('🎉 ALL AI NEURAL MALE AUDIO GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
