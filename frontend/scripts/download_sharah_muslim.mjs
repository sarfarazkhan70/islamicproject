import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/pdf');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
const targetFile = path.join(targetDir, 'sharah_sahih_muslim_vol1.pdf');

console.log('Target file:', targetFile);

if (fs.existsSync(targetFile)) {
  const stats = fs.statSync(targetFile);
  if (stats.size > 100 * 1024 * 1024) {
    console.log(`Already exists and valid, size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    process.exit(0);
  } else {
    console.log(`Incomplete file found (${stats.size} bytes), re-downloading...`);
    fs.unlinkSync(targetFile);
  }
}

const url = 'https://archive.org/download/SharahSahihMuslimUrduByAllamaGhulamRasoolSaeedi/SharhaMuslimJild1.pdf';
console.log('Downloading from:', url);

function download(urlToGet) {
  https.get(urlToGet, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      console.log('Redirecting to:', res.headers.location);
      download(res.headers.location);
      return;
    }
    if (res.statusCode !== 200) {
      console.error('Failed with status code:', res.statusCode);
      process.exit(1);
    }
    const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
    console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    let downloaded = 0;
    let lastLog = Date.now();
    const fileStream = fs.createWriteStream(targetFile);
    res.on('data', (chunk) => {
      downloaded += chunk.length;
      fileStream.write(chunk);
      if (Date.now() - lastLog > 3000) {
        lastLog = Date.now();
        const pct = totalBytes ? ((downloaded / totalBytes) * 100).toFixed(1) : '?';
        console.log(`Downloaded: ${(downloaded / 1024 / 1024).toFixed(2)} MB (${pct}%)`);
      }
    });
    res.on('end', () => {
      fileStream.end();
      console.log('Download complete! Final size:', (downloaded / 1024 / 1024).toFixed(2), 'MB');
    });
    res.on('error', (err) => {
      console.error('Stream error:', err);
      process.exit(1);
    });
  }).on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
  });
}

download(url);
