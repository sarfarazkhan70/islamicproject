import fs from 'fs';
import path from 'path';
import https from 'https';

const filesToDownload = [
  {
    url: 'https://archive.org/download/JamiaTirmiziVolume01Part01/Jamia_Tirmizi_Volume_01_-_Part_02.pdf',
    dest: 'public/pdf/jami_at_tirmizi_vol1_part2.pdf',
  },
  {
    url: 'https://archive.org/download/JamiaTirmiziVolume01Part01/Jamia_Tirmizi_Volume_01_-_Part_02_scandata.xml',
    dest: 'scripts/data/tirmizi_v1_p2_scandata.xml',
  },
  {
    url: 'https://archive.org/download/JamiaTirmiziVolume01Part01/Jamia_Tirmizi_Volume_01_-_Part_02_page_numbers.json',
    dest: 'scripts/data/tirmizi_v1_p2_page_numbers.json',
  },
];

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`Already exists: ${dest} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB)`);
    return;
  }

  console.log(`Downloading ${url} -> ${dest}...`);
  return new Promise((resolve, reject) => {
    const followRedirectAndDownload = (currentUrl) => {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`Following redirect to: ${res.headers.location}`);
          followRedirectAndDownload(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
          return;
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0');
        let downloadedBytes = 0;
        const fileStream = fs.createWriteStream(dest);

        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0 && downloadedBytes % (5 * 1024 * 1024) < chunk.length) {
            console.log(`Progress: ${(downloadedBytes / 1024 / 1024).toFixed(1)} / ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Saved: ${dest} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB)`);
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlinkSync(dest);
          reject(err);
        });
      }).on('error', reject);
    };

    followRedirectAndDownload(url);
  });
}

async function main() {
  for (const item of filesToDownload) {
    await downloadFile(item.url, item.dest);
  }
  console.log('All downloads completed!');
}

main().catch(console.error);
