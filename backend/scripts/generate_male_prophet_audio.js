const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EA654072A1C34E3F897D97FD';
const EDGE_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=' + TRUSTED_CLIENT_TOKEN;

const names = [
  { id: 'prophet-01', text: 'مُحَمَّد' },
  { id: 'prophet-02', text: 'أَحْمَد' },
  { id: 'prophet-03', text: 'الْمَاحِي' },
  { id: 'prophet-04', text: 'الْحَاشِر' },
  { id: 'prophet-05', text: 'الْعَاقِب' },
  { id: 'prophet-06', text: 'خَاتَمُ النَّبِيِّين' },
  { id: 'prophet-07', text: 'رَحْمَةٌ لِلْعَالَمِين' },
  { id: 'prophet-08', text: 'النَّبِيُّ الْأُمِّي' },
  { id: 'prophet-09', text: 'الشَّاهِد' },
  { id: 'prophet-10', text: 'الْمُبَشِّر' },
  { id: 'prophet-11', text: 'النَّذِير' },
  { id: 'prophet-12', text: 'الدَّاعِي إِلَى اللَّه' },
  { id: 'prophet-13', text: 'السِّرَاجُ الْمُنِير' },
  { id: 'prophet-14', text: 'الْمُزَّمِّل' },
  { id: 'prophet-15', text: 'الْمُدَّثِّر' },
  { id: 'prophet-16', text: 'نَبِيُّ الرَّحْمَة' },
  { id: 'prophet-17', text: 'نَبِيُّ التَّوْبَة' },
  { id: 'prophet-18', text: 'الْمُتَوَكِّل' },
  { id: 'prophet-19', text: 'الْأَمِين' },
  { id: 'prophet-20', text: 'الصَّادِق' },
  { id: 'prophet-21', text: 'الْمُصْطَفَى' },
  { id: 'prophet-22', text: 'الْمُخْتَار' },
  { id: 'prophet-23', text: 'سَيِّدُ وَلَدِ آدَم' },
  { id: 'prophet-24', text: 'صَاحِبُ الْمَقَامِ الْمَحْمُود' },
  { id: 'prophet-25', text: 'صَاحِبُ الْكَوْثَر' },
  { id: 'prophet-26', text: 'شَفِيعُ الْمُذْنِبِين' },
  { id: 'prophet-27', text: 'رَؤُوفٌ رَحِيم' },
  { id: 'prophet-28', text: 'الْهَادِي' },
  { id: 'prophet-29', text: 'الْمُذَكِّر' },
  { id: 'prophet-30', text: 'الْقَاسِم' }
];

function synthesize(text, voice, outputPath) {
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
      const configMsg = 'X-Timestamp:' + new Date().toISOString() + '\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}';
      ws.send(configMsg);

      const ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="' + voice + '">' + text + '</voice></speak>';
      const requestMsg = 'X-RequestId:' + requestId + '\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:' + new Date().toISOString() + 'Z\r\nPath:ssml\r\n\r\n' + ssml;
      ws.send(requestMsg);
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const headerLen = data.readUInt16BE(0);
        const audioData = data.slice(2 + headerLen);
        audioChunks.push(audioData);
      } else {
        const textMsg = data.toString();
        if (textMsg.includes('Path:turn.end')) {
          ws.close();
          const buffer = Buffer.concat(audioChunks);
          fs.writeFileSync(outputPath, buffer);
          resolve(buffer.length);
        }
      }
    });

    ws.on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const outDir = 'c:/IslamicPrayer/frontend/public/audio/prophet';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const voice = 'ar-SA-HamedNeural'; // Prestigious Saudi Arabic Male Voice
  console.log('Generating 30 Prophet names audio files with Male Arabic voice:', voice);

  for (const item of names) {
    const dest = path.join(outDir, item.id + '.mp3');
    try {
      const size = await synthesize(item.text, voice, dest);
      console.log('Generated [MALE VOICE]:', item.id, item.text, size, 'bytes');
    } catch (err) {
      console.error('Error generating:', item.id, err.message);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('All 30 Prophet male audio files generated successfully!');
}

run();
