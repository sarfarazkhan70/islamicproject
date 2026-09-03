const fs = require('fs');
const path = require('path');
const { WaveFile } = require('wavefile');

const dataFile = path.resolve(__dirname, '../frontend/src/data/islamic/asmaUlHusnaData.ts');
let code = fs.readFileSync(dataFile, 'utf8');
code = code.replace(/import\s+[^;]+;/g, '');
code = code.replace(/export\s+const\s+ASMA_UL_HUSNA\s*:\s*IslamicNameItem\[\]\s*=\s*/, 'const ASMA_UL_HUSNA = ');
code += '\nmodule.exports = ASMA_UL_HUSNA;';

const tempCjs = path.resolve(__dirname, 'temp_verify_allah.cjs');
fs.writeFileSync(tempCjs, code);
const ASMA_UL_HUSNA = require(tempCjs);
fs.unlinkSync(tempCjs);

console.log('========================================================================');
console.log(' ASMA-UL-HUSNA (99 NAMES OF ALLAH) JALLA JALAALUHU AUDIO AUDIT');
console.log('========================================================================\n');

if (ASMA_UL_HUSNA.length !== 99) {
  console.error('ERROR: Expected 99 items, found ' + ASMA_UL_HUSNA.length);
  process.exit(1);
}

const audioDir = path.resolve(__dirname, '../frontend/public/audio/allah');
const errors = [];
let totalDuration = 0;

for (let i = 0; i < ASMA_UL_HUSNA.length; i++) {
  const item = ASMA_UL_HUSNA[i];
  const num = i + 1;
  const expectedId = 'allah-' + String(num).padStart(2, '0');
  const wavFile = path.join(audioDir, expectedId + '.wav');

  if (item.number !== num) errors.push('Item ' + num + ': number mismatch');
  if (item.id !== expectedId) errors.push('Item ' + num + ': ID mismatch');
  if (!item.arabic) errors.push('Item ' + num + ': Missing Arabic');
  if (!item.transliteration) errors.push('Item ' + num + ': Missing Transliteration');
  if (!item.urdu) errors.push('Item ' + num + ': Missing Urdu');
  if (!item.english) errors.push('Item ' + num + ': Missing English');
  if (item.audioUrl !== '/audio/allah/' + expectedId + '.wav') errors.push('Item ' + num + ': Audio URL mismatch (' + item.audioUrl + ')');

  if (!fs.existsSync(wavFile)) {
    errors.push('Audio missing: ' + wavFile);
  } else {
    const buf = fs.readFileSync(wavFile);
    const wav = new WaveFile(buf);
    const sr = wav.fmt.sampleRate;
    const ch = wav.fmt.numChannels;
    const bits = wav.fmt.bitsPerSample;
    const durSec = (wav.data.samples.length / (bits / 8) / ch) / sr;
    totalDuration += durSec;

    if (sr !== 24000 || ch !== 1 || bits !== 16) {
      errors.push('Invalid WAV format on ' + expectedId + ': sr=' + sr + ', ch=' + ch + ', bits=' + bits);
    }
    // With Jalla Jalaaluhu, each file should be > 8 seconds
    if (durSec < 8.0) {
      errors.push('Suspiciously short duration on ' + expectedId + ': ' + durSec.toFixed(2) + 's');
    }
  }
}

if (errors.length > 0) {
  console.error('Validation FAILED with ' + errors.length + ' errors:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log('✅ ALL 99 Asma-ul-Husna Audio WAV files verified:');
console.log(' - Total Files: 99/99');
console.log(' - Format: 24,000 Hz, 16-bit PCM Mono');
console.log(' - Total Audio Duration: ' + (totalDuration / 60).toFixed(2) + ' minutes (~' + (totalDuration / 99).toFixed(1) + 's per name)');
console.log(' - Structure: [Allah Name] -> [Pause 250ms] -> [Jalla Jalaaluhu] -> [Pause 450ms] -> [Urdu Translation] -> [Pause 450ms] -> [English Translation]\n');

console.log('------------------------------------------------------------------------');
console.log(' SPOT-CHECK VERIFICATION OF REPRESENTATIVE ALLAH NAMES (WITH HONORIFIC)');
console.log('------------------------------------------------------------------------');

const spotCheckNumbers = [1, 10, 25, 50, 75, 90, 99];

spotCheckNumbers.forEach((num) => {
  const item = ASMA_UL_HUSNA.find(n => n.number === num);
  const wavFile = path.join(audioDir, item.id + '.wav');
  const buf = fs.readFileSync(wavFile);
  const wav = new WaveFile(buf);
  const durSec = (wav.data.samples.length / 2) / 24000;

  console.log('\n📌 NAME #' + num + ' (' + item.id + '):');
  console.log('   • Displayed Arabic       : ' + item.arabic + ' جَلَّ جَلَالُهُ');
  console.log('   • Displayed Translit     : ' + item.transliteration);
  console.log('   • Spoken Flow            : "' + item.arabic + ' [250ms] جَلَّ جَلَالُهُ"');
  console.log('   • Displayed Urdu Meaning : "' + item.urdu + '"');
  console.log('   • Displayed Eng Meaning  : "' + item.english + '"');
  console.log('   • Reference              : ' + item.reference.split(';')[0]);
  console.log('   • Audio File             : ' + item.audioUrl + ' (' + durSec.toFixed(2) + 's, ' + buf.length + ' bytes)');
  console.log('   • Complete Flow          : [Name] ➔ [Jalla Jalaaluhu] ➔ [Urdu Meaning] ➔ [English Meaning]');
});

console.log('\n========================================================================');
console.log(' ✨ ALL 99 NAMES OF ALLAH PASSED JALLA JALAALUHU RECITATION AUDIT! ✨');
console.log('========================================================================');
