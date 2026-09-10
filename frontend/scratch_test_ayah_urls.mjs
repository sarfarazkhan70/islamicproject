import fs from 'fs';

async function testAyahAudioUrls() {
  const sampleAyahs = [
    '001001.mp3', // Surah 1 Ayah 1 (Bismillah)
    '001002.mp3', // Surah 1 Ayah 2 (Alhamdu lillahi...)
    '001003.mp3', // Surah 1 Ayah 3 (Ar-Rahmanir-Rahim)
    '001004.mp3', // Surah 1 Ayah 4 (Maliki yawmid-deen)
    '001005.mp3', // Surah 1 Ayah 5 (Iyyaka na'budu...)
    '001006.mp3', // Surah 1 Ayah 6 (Ihdinas-sirat...)
    '001007.mp3', // Surah 1 Ayah 7 (Siratallazeena...)
    '112001.mp3', // Surah 112 Ayah 1 (Qul huwallahu ahad)
    '112002.mp3', // Surah 112 Ayah 2 (Allahus-samad)
    '114001.mp3', // Surah 114 Ayah 1 (Qul a'oozu bi-rabbin-naas)
  ];

  console.log("=== Testing Archive.org Ayah MP3 direct downloads ===");

  for (const filename of sampleAyahs) {
    const url = `https://archive.org/download/kanzul-iman-urdu-audio-translation/${filename}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`File: ${filename} | Status: ${res.status} | Content-Type: ${res.headers.get('content-type')} | Content-Length: ${res.headers.get('content-length')} bytes`);
    } catch (e) {
      console.error(`Error fetching ${filename}:`, e.message);
    }
  }

  // Also let's download 001001.mp3 and 001002.mp3 to inspect their content
  const testUrl = `https://archive.org/download/kanzul-iman-urdu-audio-translation/001002.mp3`;
  console.log(`\nDownloading 001002.mp3 from ${testUrl}...`);
  const res = await fetch(testUrl);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync('test_001002.mp3', buffer);
  console.log(`Saved test_001002.mp3 (${buffer.length} bytes)`);
}

testAyahAudioUrls();
