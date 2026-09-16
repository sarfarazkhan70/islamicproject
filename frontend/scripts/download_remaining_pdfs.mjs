import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function downloadFile(url, dest, label) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000_000) {
      console.log(`✓ ${label} already exists (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(1)} MB)`);
      resolve();
      return;
    }

    console.log(`Downloading ${label} from: ${url}`);
    function get(u) {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${label}: HTTP ${res.statusCode}`));
          return;
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        let lastReported = 0;

        const fileStream = fs.createWriteStream(dest);
        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (downloadedBytes - lastReported > 15 * 1024 * 1024 || downloadedBytes === totalBytes) {
            lastReported = downloadedBytes;
            console.log(
              `[${label}] ${(downloadedBytes / (1024 * 1024)).toFixed(1)}MB / ${(totalBytes / (1024 * 1024)).toFixed(1)}MB`
            );
          }
        });

        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ ${label} download complete! Saved to ${dest} (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(1)} MB)`);
          resolve();
        });
      }).on('error', (err) => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    }
    get(url);
  });
}

async function main() {
  const volumes = [4, 5, 6, 7];
  for (const v of volumes) {
    const url = `https://archive.org/download/SharahSahihMuslimUrduByAllamaGhulamRasoolSaeedi/SharhaMuslimJild${v}.pdf`;
    const dest = path.resolve(__dirname, `../public/pdf/sharah_sahih_muslim_vol${v}.pdf`);
    await downloadFile(url, dest, `Volume ${v} PDF`);
  }
  console.log('✓ All remaining PDFs (Vol 4-7) downloaded successfully!');
}

main().catch(console.error);
