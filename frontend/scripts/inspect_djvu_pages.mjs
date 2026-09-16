import https from 'https';
import http from 'http';

function getXml(url) {
  const client = url.startsWith('https') ? https : http;
  client.get(url, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return getXml(res.headers.location);
    }
    let data = '';
    res.on('data', chunk => {
      data += chunk;
      if (data.length > 500000) {
        res.destroy();
        const pages = [...data.matchAll(/<PAGECOLUMN>[\s\S]*?<\/PAGECOLUMN>/g)];
        console.log(`Captured ${data.length} bytes.`);
        // Look for lines containing numbers
        const lines = data.split('\n').filter(l => l.includes('<LINE>'));
        console.log('Sample lines:', lines.slice(0, 30));
      }
    });
  });
}

getXml('https://archive.org/download/SharahSahihMuslimUrduByAllamaGhulamRasoolSaeedi/SharhaMuslimJild2_djvu.xml');
