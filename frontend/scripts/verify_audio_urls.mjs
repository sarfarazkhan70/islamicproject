const surahs = [1, 2, 18, 36, 67, 112, 114];

function getAudioUrl(surahNumber, reciterId) {
  const padded = String(surahNumber).padStart(3, '0');
  if (reciterId === 1) return `https://download.quranicaudio.com/qdc/abdul_baset/mujawwad/${surahNumber}.mp3`;
  if (reciterId === 2) return `https://download.quranicaudio.com/qdc/abdul_baset/murattal/${surahNumber}.mp3`;
  if (reciterId === 3) return `https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/${surahNumber}.mp3`;
  if (reciterId === 4) return `https://download.quranicaudio.com/qdc/abu_bakr_shatri/murattal/${surahNumber}.mp3`;
  if (reciterId === 5) return `https://download.quranicaudio.com/qdc/hani_ar_rifai/murattal/${surahNumber}.mp3`;
  if (reciterId === 6) return `https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/${surahNumber}.mp3`;
  if (reciterId === 9) return `https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal/${surahNumber}.mp3`;
  if (reciterId === 10) return `https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/${padded}.mp3`;
  if (reciterId === 12) return `https://download.quranicaudio.com/qdc/khalil_al_husary/muallim/${surahNumber}.mp3`;
  if (reciterId === 13) return `https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/${padded}.mp3`;
  return `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNumber}.mp3`;
}

async function testAll() {
  for (const s of surahs) {
    for (const r of [7, 1, 3, 6, 9, 10]) {
      const url = getAudioUrl(s, r);
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status !== 200) {
          console.error('FAILED:', s, r, url, res.status);
        } else {
          console.log(`OK: Surah ${s} Reciter ${r} -> ${res.status}`);
        }
      } catch (e) {
        console.error('FETCH ERROR:', s, r, url, e.message);
      }
    }
  }
  console.log('All sample surahs tested!');
}
testAll();
