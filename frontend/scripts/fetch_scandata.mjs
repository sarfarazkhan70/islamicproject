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

fetchUrl('https://archive.org/download/SahihMuslimInUrduVol1/Sahih%20Muslim%20in%20Urdu%20Vol-1_scandata.xml', (scandata) => {
  console.log('Scandata length:', scandata.length);
  fs.writeFileSync('scripts/scandata.xml', scandata);
  
  // Extract page tags
  const matches = [...scandata.matchAll(/<page\s+leafNum="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)];
  console.log('Total pages in scandata:', matches.length);
  matches.slice(0, 10).forEach(m => {
    console.log(`Leaf ${m[1]}:`, m[2].replace(/\s+/g, ' ').trim());
  });
  console.log('--- LAST 10 LEAVES ---');
  matches.slice(-10).forEach(m => {
    console.log(`Leaf ${m[1]}:`, m[2].replace(/\s+/g, ' ').trim());
  });
});
