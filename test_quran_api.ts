import { QuranApiService } from './frontend/src/services/quranApiService.js';

async function runTests() {
  console.log('--- 1. Testing Chapters List ---');
  const chapters = await QuranApiService.getChapters();
  console.log(`Fetched ${chapters.length} chapters.`);
  if (chapters.length !== 114) throw new Error('Expected 114 chapters');
  console.log(`Chapter 1: ${chapters[0].name_simple} (${chapters[0].name_arabic}) - Verses: ${chapters[0].verses_count}`);

  console.log('\n--- 2. Testing Surah 1 Verses with Translations & Tajweed ---');
  const verses = await QuranApiService.getVersesByChapter(1, [234, 20, 831]);
  console.log(`Fetched ${verses.length} verses for Surah 1.`);
  if (verses.length !== 7) throw new Error('Expected 7 verses for Surah 1');
  const v1 = verses[0];
  console.log('Verse 1:1 Uthmani:', v1.text_uthmani);
  console.log('Verse 1:1 IndoPak:', v1.text_indopak);
  console.log('Verse 1:1 Tajweed markup:', v1.text_uthmani_tajweed?.slice(0, 50) + '...');
  console.log('Verse 1:1 Translations count:', v1.translations?.length);
  (v1.translations || []).forEach((t: any) => {
    console.log(` - Translation (Resource ${t.resource_id}):`, t.text?.replace(/<[^>]*>?/gm, ''));
  });

  console.log('\n--- 3. Testing Surah Historical Context Info ---');
  const info = await QuranApiService.getChapterInfo(1);
  console.log(`Surah 1 Info loaded: Source: ${info?.source}, Length: ${info?.text?.length} chars.`);

  console.log('\n--- 4. Testing Recitation Audio Endpoint ---');
  const audioUrl = await QuranApiService.getChapterRecitationAudio(7, 1);
  console.log('Recitation audio URL for Mishary Rashid:', audioUrl);

  console.log('\n--- 5. Testing Ayah Audio URL Constructor ---');
  const ayahAudio = QuranApiService.getAyahAudioUrl('1:1', 'Alafasy');
  console.log('Ayah 1:1 audio URL:', ayahAudio);

  console.log('\n=== ALL QURAN.COM API TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
