import { MPEGDecoder } from 'mpg123-decoder';
import fs from 'fs';
import path from 'path';
import pkg from 'wavefile';
const { WaveFile } = pkg;
async function setupLame() {
    // @ts-ignore
    const mpegModeModule = await import('lamejs/src/js/MPEGMode.js');
    global.MPEGMode = mpegModeModule.default || mpegModeModule;
    globalThis.MPEGMode = global.MPEGMode;
    // @ts-ignore
    const LameModule = await import('lamejs/src/js/Lame.js');
    global.Lame = LameModule.default || LameModule;
    globalThis.Lame = global.Lame;
    // @ts-ignore
    const BitStreamModule = await import('lamejs/src/js/BitStream.js');
    global.BitStream = BitStreamModule.default || BitStreamModule;
    // @ts-ignore
    const TablesModule = await import('lamejs/src/js/Tables.js');
    global.Tables = TablesModule.default || TablesModule;
    // @ts-ignore
    const lamejsModule = await import('lamejs');
    return lamejsModule.default || lamejsModule;
}
async function buildAudio() {
    const lamejs = await setupLame();
    const filePath = path.resolve('../frontend/public/audio/madina_azaan.mp3');
    const buf = fs.readFileSync(filePath);
    const decoder = new MPEGDecoder();
    await decoder.ready;
    const decoded = decoder.decode(buf);
    const left = decoded.channelData[0];
    const right = decoded.channelData[1];
    const sampleRate = decoded.sampleRate; // 16000
    // Segments definition:
    // 1. Hayya 'alas-Salah #1: 134.8s -> 147.2s
    // 2. Hayya 'alas-Salah #2: 155.0s -> 166.5s
    // 3. Hayya 'alal-Falah #1: 172.0s -> 183.8s
    // 4. Hayya 'alal-Falah #2: 194.5s -> 207.0s
    const segments = [
        { name: "Hayya 'alas-Salah 1", start: 134.8, end: 147.2 },
        { name: "Hayya 'alas-Salah 2", start: 155.0, end: 166.5 },
        { name: "Hayya 'alal-Falah 1", start: 172.0, end: 183.8 },
        { name: "Hayya 'alal-Falah 2", start: 194.5, end: 207.0 },
    ];
    const pauseDurationSec = 1.0;
    const pauseSamples = Math.floor(pauseDurationSec * sampleRate);
    const fadeSamples = Math.floor(0.04 * sampleRate); // 40ms fade
    const combinedLeft = [];
    const combinedRight = [];
    for (let sIdx = 0; sIdx < segments.length; sIdx++) {
        const seg = segments[sIdx];
        const startSample = Math.floor(seg.start * sampleRate);
        const endSample = Math.min(Math.floor(seg.end * sampleRate), left.length);
        const count = endSample - startSample;
        for (let i = 0; i < count; i++) {
            let l = left[startSample + i];
            let r = right[startSample + i];
            // Fade in
            if (i < fadeSamples) {
                const factor = i / fadeSamples;
                l *= factor;
                r *= factor;
            }
            // Fade out
            if (i >= count - fadeSamples) {
                const factor = (count - i) / fadeSamples;
                l *= factor;
                r *= factor;
            }
            combinedLeft.push(l);
            combinedRight.push(r);
        }
        // Inter-phrase pause
        if (sIdx < segments.length - 1) {
            for (let p = 0; p < pauseSamples; p++) {
                combinedLeft.push(0);
                combinedRight.push(0);
            }
        }
    }
    // Trailing silence (0.4s)
    const trailSamples = Math.floor(0.4 * sampleRate);
    for (let t = 0; t < trailSamples; t++) {
        combinedLeft.push(0);
        combinedRight.push(0);
    }
    const totalSamples = combinedLeft.length;
    const leftInt16 = new Int16Array(totalSamples);
    const rightInt16 = new Int16Array(totalSamples);
    // Peak normalization to 0.95
    let maxAmp = 0;
    for (let i = 0; i < totalSamples; i++) {
        if (Math.abs(combinedLeft[i]) > maxAmp)
            maxAmp = Math.abs(combinedLeft[i]);
        if (Math.abs(combinedRight[i]) > maxAmp)
            maxAmp = Math.abs(combinedRight[i]);
    }
    const normFactor = maxAmp > 0 ? 0.95 / maxAmp : 1.0;
    for (let i = 0; i < totalSamples; i++) {
        let l = combinedLeft[i] * normFactor;
        let r = combinedRight[i] * normFactor;
        l = Math.max(-1, Math.min(1, l));
        r = Math.max(-1, Math.min(1, r));
        leftInt16[i] = l < 0 ? l * 0x8000 : l * 0x7fff;
        rightInt16[i] = r < 0 ? r * 0x8000 : r * 0x7fff;
    }
    const durationSec = totalSamples / sampleRate;
    console.log(`Duration: ${durationSec.toFixed(2)} seconds`);
    // 1. Write standard WAV file
    const wav = new WaveFile();
    wav.fromScratch(2, sampleRate, '16', [leftInt16, rightInt16]);
    const wavBuffer = wav.toBuffer();
    const outWavPath = path.resolve('../frontend/public/audio/namaz_reminder.wav');
    fs.writeFileSync(outWavPath, wavBuffer);
    console.log(`Saved WAV: ${outWavPath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
    // 2. Encode to true standard MP3 bitstream
    const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, 128);
    const mp3Data = [];
    const blockSize = 1152;
    for (let i = 0; i < totalSamples; i += blockSize) {
        const leftChunk = leftInt16.subarray(i, i + blockSize);
        const rightChunk = rightInt16.subarray(i, i + blockSize);
        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(Buffer.from(mp3buf));
        }
    }
    const endBuf = mp3encoder.flush();
    if (endBuf.length > 0) {
        mp3Data.push(Buffer.from(endBuf));
    }
    const mp3Buffer = Buffer.concat(mp3Data);
    const outMp3Path = path.resolve('../frontend/public/audio/namaz_reminder.mp3');
    fs.writeFileSync(outMp3Path, mp3Buffer);
    console.log(`Saved MP3: ${outMp3Path} (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);
    // 3. Verify MP3 decodability with MPEGDecoder
    const testDecoder = new MPEGDecoder();
    await testDecoder.ready;
    const reDecoded = testDecoder.decode(mp3Buffer);
    console.log(`Verification: Successfully decoded output MP3!`);
    console.log(`Decoded sampleRate: ${reDecoded.sampleRate} Hz`);
    console.log(`Decoded duration: ${(reDecoded.channelData[0].length / reDecoded.sampleRate).toFixed(2)} seconds`);
    testDecoder.free();
    decoder.free();
}
buildAudio().catch(console.error);
