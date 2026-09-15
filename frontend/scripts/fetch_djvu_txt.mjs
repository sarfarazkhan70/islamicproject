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

fetchUrl('https://archive.org/download/SahihMuslimInUrduVol1/Sahih%20Muslim%20in%20Urdu%20Vol-1_djvu.txt', (txt) => {
  console.log('Djvu txt length:', txt.length);
  // Pages in djvu.txt are usually separated by form feed \f or [page]
  const pages = txt.split(/\f/);
  console.log('Total pages in djvu txt:', pages.length);
  
  console.log('=== FIRST 10 PAGES in PDF order (0 to 9) ===');
  for (let i = 0; i < Math.min(10, pages.length); i++) {
    console.log(`--- PDF Page ${i + 1} (length: ${pages[i].trim().length}) ---`);
    console.log(pages[i].trim().slice(0, 200));
  }

  console.log('=== LAST 10 PAGES in PDF order ===');
  for (let i = Math.max(0, pages.length - 10); i < pages.length; i++) {
    console.log(`--- PDF Page ${i + 1} (length: ${pages[i].trim().length}) ---`);
    console.log(pages[i].trim().slice(0, 200));
  }
  
  fs.writeFileSync('scripts/djvu_pages_summary.json', JSON.stringify(pages.map((p, idx) => ({
    pageNum: idx + 1,
    len: p.trim().length,
    snippet: p.trim().replace(/\s+/g, ' ').slice(0, 100),
    isWhitespaceOnly: p.trim().length === 0,
  })), null, 2));
});
