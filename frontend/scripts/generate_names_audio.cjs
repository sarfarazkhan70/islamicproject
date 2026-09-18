const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const crypto = require('crypto');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EA654070B157608F6E0FF213';

function generateEdgeTTS(ssmlContent) {
  return new Promise((resolve, reject) => {
    const connectionId = crypto.randomUUID().replace(/-/g, '');
    const wssUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}`;

    const ws = new WebSocket(wssUrl, {
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const audioChunks = [];
    const requestId = crypto.randomUUID().replace(/-/g, '');

    ws.on('open', () => {
      const date = new Date().toISOString();
      const configMessage =
        `X-Timestamp:${date}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
              },
            },
          },
        });
      ws.send(configMessage);

      const ssmlMessage =
        `X-RequestId:${requestId}\r\n` +
        `X-Timestamp:${date}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssmlContent;
      ws.send(ssmlMessage);
    });

    ws.on('message', (data, isBinary) => {
      if (!isBinary) {
        const text = data.toString();
        if (text.includes('Path:turn.end')) {
          ws.close();
          resolve(Buffer.concat(audioChunks));
        }
      } else {
        const buf = Buffer.from(data);
        const headerEnd = buf.indexOf(Buffer.from('\r\n\r\n'));
        if (headerEnd !== -1) {
          const audioData = buf.subarray(headerEnd + 4);
          if (audioData.length > 0) {
            audioChunks.push(audioData);
          }
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WS Error:', err);
      reject(err);
    });

    ws.on('close', () => {
      if (audioChunks.length > 0) {
        resolve(Buffer.concat(audioChunks));
      }
    });
  });
}

async function run() {
  console.log('Testing Edge TTS...');
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="ur-PK-AsadNeural">
      <prosody rate="-5%" pitch="-2%">اللہ تعالیٰ۔ اللہ سب سے بلند اور سب سے پاک ہے۔</prosody>
    </voice>
  </speak>`;

  const buf = await generateEdgeTTS(ssml);
  console.log('Success! Buffer size:', buf.length, 'bytes');
}

run().catch(console.error);
