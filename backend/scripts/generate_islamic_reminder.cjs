const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EA654072A1C34E3F897D97FD';
const EDGE_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=' + TRUSTED_CLIENT_TOKEN;

function synthesizeReminder(outputPath) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(EDGE_URL, {
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold'
      }
    });

    const requestId = crypto.randomUUID().replace(/-/g, '');
    const audioChunks = [];

    ws.on('open', () => {
      // 1. Config Message
      const configMsg = 'X-Timestamp:' + new Date().toISOString() + '\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}';
      ws.send(configMsg);

      // 2. SSML with respectful, calm, dignified pacing (prosody -18% and deliberate pauses)
      const ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ur-PK">
  <voice name="ur-PK-AsadNeural">
    <prosody rate="-16%" pitch="-1Hz">
      اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ۔
      <break time="1200ms"/>
      نماز کا وقت ہو گیا ہے۔
      <break time="1000ms"/>
      اللہ تعالیٰ ہمیں اپنی نماز وقت پر ادا کرنے کی توفیق عطا فرمائے۔
      <break time="1200ms"/>
      دنیا کے کام کچھ دیر کے لیے چھوڑ کر اپنے رب کی طرف رجوع کیجیے۔
      <break time="1200ms"/>
      نماز مومن کی زندگی کا نور ہے۔
      <break time="1000ms"/>
      اللہ کے ذکر اور نماز کی طرف توجہ کیجیے۔
      <break time="1200ms"/>
      اللہ ہم سب کی نماز قبول فرمائے۔
      <break time="1200ms"/>
      آمین۔
    </prosody>
  </voice>
</speak>`;

      const ssmlMsg = 'X-RequestId:' + requestId + '\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:' + new Date().toISOString() + '\r\nPath:ssml\r\n\r\n' + ssmlText;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const headerLen = data.readUInt16BE(0);
        if (data.length > headerLen + 2) {
          const audioChunk = data.slice(headerLen + 2);
          audioChunks.push(audioChunk);
        }
      } else {
        const text = data.toString('utf8');
        if (text.includes('Path:turn.end')) {
          ws.close();
          const finalBuffer = Buffer.concat(audioChunks);
          fs.writeFileSync(outputPath, finalBuffer);
          resolve(finalBuffer);
        }
      }
    });

    ws.on('error', (err) => {
      reject(err);
    });
  });
}

const outPath = path.resolve(__dirname, '../../frontend/public/audio/namaz_reminder.mp3');
const wavCopy = path.resolve(__dirname, '../../frontend/public/audio/namaz_reminder.wav');

console.log('Synthesizing authentic Islamic spoken male reminder in Urdu...');
synthesizeReminder(outPath).then((buffer) => {
  console.log('Successfully saved to:', outPath);
  console.log('File size:', buffer.length, 'bytes (~' + (buffer.length / 1024).toFixed(1) + ' KB)');
  fs.copyFileSync(outPath, wavCopy);
  console.log('Synchronized to:', wavCopy);
}).catch((err) => {
  console.error('Error generating audio:', err);
  process.exit(1);
});
