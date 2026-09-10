async function testUrls() {
  const reciters = [7, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13];
  for (const r of [7, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]) {
    try {
      const quranComRes = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${r}/1`);
      const quranComData = await quranComRes.json();
      const audioUrl = quranComData.audio_file?.audio_url;
      console.log(`Quran.com Reciter ${r} Surah 1:`, audioUrl);
      if (audioUrl) {
        const res = await fetch(audioUrl, { method: 'HEAD' });
        console.log(`  -> Status ${r}:`, res.status);
      }
    } catch (e) {
      console.error(`Error for reciter ${r}:`, e.message);
    }
  }

  // Test static server URLs
  const testStatic = [
    'https://server8.mp3quran.net/afs/001.mp3',
    'https://server7.mp3quran.net/basit/001.mp3',
    'https://server11.mp3quran.net/sds/001.mp3'
  ];
  for (const u of testStatic) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(`Static URL ${u} status:`, res.status);
    } catch (e) {
      console.error(`Static URL error ${u}:`, e.message);
    }
  }

  // Test Ayah-by-Ayah URLs (e.g. verses.quran.com / everyayah.com)
  const ayahUrls = [
    'https://verses.quran.com/Alafasy/mp3/001001.mp3',
    'https://verses.quran.com/Alafasy/mp3/001002.mp3',
    'https://everyayah.com/data/Alafasy_128kbps/001001.mp3'
  ];
  for (const u of ayahUrls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(`Ayah URL ${u} status:`, res.status);
    } catch (e) {
      console.error(`Ayah URL error ${u}:`, e.message);
    }
  }
}
testUrls();
