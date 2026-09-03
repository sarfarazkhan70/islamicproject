async function checkTranslations() {
  const res = await fetch('https://api.quran.com/api/v4/resources/translations');
  const data = await res.json();
  const urduTrans = data.translations.filter(t => t.language_name === 'urdu' || t.name.toLowerCase().includes('roman') || t.name.toLowerCase().includes('urdu'));
  console.log('Urdu / Roman Urdu Translations in Quran.com API:');
  console.log(JSON.stringify(urduTrans, null, 2));

  // Also test fetching verse 1 of Surah 1 with Roman Urdu ID
  for (const t of urduTrans) {
    try {
      const vRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/1?translations=${t.id}`);
      const vData = await vRes.json();
      console.log(`Translation ID ${t.id} (${t.name} - ${t.author_name}):`);
      console.log('Verse 1:', vData.verses?.[0]?.translations?.[0]?.text);
    } catch (e) {
      console.log(`Failed for ID ${t.id}:`, e.message);
    }
  }
}

checkTranslations().catch(console.error);
