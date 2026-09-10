// Using native fetch in Node 18+

async function searchArchive() {
  const queries = [
    'title:("Kanzul Iman") AND mediatype:audio',
    'title:("Kanz-ul-Iman") AND mediatype:audio',
    'title:("Kanzuliman") AND mediatype:audio',
    'description:("Kanzul Iman") AND mediatype:audio',
    'description:("Kanz-ul-Iman") AND mediatype:audio',
    'description:("Ahmad Raza") AND mediatype:audio',
    '"Kanzul Iman" AND mediatype:audio',
    '"Kanz-ul-Iman" AND mediatype:audio',
    '"Kanz ul Iman" AND mediatype:audio',
    '"Tilawaat E Quran" AND mediatype:audio'
  ];

  const seen = new Set();
  const allResults = [];

  for (const q of queries) {
    console.log(`\n=== Running query: ${q}`);
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title,description,downloads,year,publicdate,creator&rows=25&output=json`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.response && data.response.docs) {
        for (const doc of data.response.docs) {
          if (!seen.has(doc.identifier)) {
            seen.add(doc.identifier);
            allResults.push(doc);
            console.log(`[Found] ID: ${doc.identifier}`);
            console.log(`        Title: ${doc.title}`);
            console.log(`        Creator: ${doc.creator || 'N/A'}`);
            console.log(`        Downloads: ${doc.downloads}`);
          }
        }
      }
    } catch (e) {
      console.error(`Error querying ${q}:`, e.message);
    }
  }

  console.log(`\nTotal unique audio collections found: ${allResults.length}`);
}

searchArchive();
