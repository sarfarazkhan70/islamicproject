import https from 'https';
import http from 'http';
import fs from 'fs';

function fetchUrl(url, cb) {
  const client = url.startsWith('https') ? https : http;
  client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchUrl(res.headers.location, cb);
    }
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => cb(data));
  });
}

fetchUrl('https://archive.org/download/SahihMuslimInUrduVol1/Sahih%20Muslim%20in%20Urdu%20Vol-1_djvu.xml', (xml) => {
  console.log('Djvu xml length:', xml.length);
  // Match <OBJECT ...> or <PAGE ...>
  const pageRegex = /<OBJECT\s+[^>]*>([\s\S]*?)<\/OBJECT>/gi;
  const pages = [...xml.matchAll(pageRegex)];
  console.log('Total OBJECT tags in djvu xml:', pages.length);

  for (let i = 0; i < Math.min(10, pages.length); i++) {
    const pText = pages[i][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Leaf ${i + 1} (len: ${pText.length}): ${pText.slice(0, 150)}`);
  }

  console.log('--- LAST 10 OBJECTS ---');
  for (let i = Math.max(0, pages.length - 10); i < pages.length; i++) {
    const pText = pages[i][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Leaf ${i + 1} (len: ${pText.length}): ${pText.slice(0, 150)}`);
  }

  const allSummary = pages.map((p, idx) => {
    const text = p[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      leafNum: idx + 1,
      textLen: text.length,
      snippet: text.slice(0, 80),
      isBlank: text.length < 5,
    };
  });

  fs.writeFileSync('scripts/djvu_leaves_summary.json', JSON.stringify(allSummary, null, 2));
  console.log('Saved to scripts/djvu_leaves_summary.json');
});
