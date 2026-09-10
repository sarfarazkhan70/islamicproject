async function inspectItem(identifier) {
  const url = `https://archive.org/metadata/${identifier}`;
  console.log(`\n======================================================`);
  console.log(`INSPECTING ARCHIVE ITEM: ${identifier}`);
  console.log(`======================================================`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Title:`, data.metadata?.title);
    console.log(`Description:`, data.metadata?.description?.slice(0, 300));
    console.log(`Creator:`, data.metadata?.creator);
    console.log(`Date:`, data.metadata?.date || data.metadata?.publicdate);
    console.log(`Total files:`, data.files?.length);

    const audioFiles = data.files?.filter(f => f.format === 'VBR MP3' || f.format === 'MP3' || f.name.endsWith('.mp3')) || [];
    console.log(`MP3 files count:`, audioFiles.length);

    if (audioFiles.length > 0) {
      console.log(`Sample files (first 10):`);
      audioFiles.slice(0, 10).forEach(f => {
        console.log(` - Name: ${f.name} | Size: ${f.size} | Length: ${f.length || 'N/A'}s | Title: ${f.title || 'N/A'}`);
      });
      if (audioFiles.length > 10) {
        console.log(`Sample files (last 5):`);
        audioFiles.slice(-5).forEach(f => {
          console.log(` - Name: ${f.name} | Size: ${f.size} | Length: ${f.length || 'N/A'}s | Title: ${f.title || 'N/A'}`);
        });
      }
    }
  } catch (e) {
    console.error(`Error inspecting ${identifier}:`, e.message);
  }
}

async function main() {
  const items = [
    'kanzul-iman-urdu-audio-translation',
    'TilawaatEQuranByMuhammadAsadAttariAndTarjumaEKanzUlImanByAbdulHabibAttari',
    'QuranWithUrduTranslationKanzUlImanRecitedByQariBashirChishti',
    'kanzuliman_201907',
    'AlaHazrat.netQuranRecitationWithUrduTranslationByImamAhmadRaza',
    'KanzUlIman_658',
    'quran-kanz-ul-iman-english'
  ];

  for (const item of items) {
    await inspectItem(item);
  }
}

main();
