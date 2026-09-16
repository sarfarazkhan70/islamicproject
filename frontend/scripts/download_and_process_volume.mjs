import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const volNum = parseInt(process.argv[2], 10);
if (!volNum || volNum < 1 || volNum > 7) {
  console.error('Usage: node scripts/download_and_process_volume.mjs <volumeNumber>');
  process.exit(1);
}

const pdfUrl = `https://archive.org/download/SharahSahihMuslimUrduByAllamaGhulamRasoolSaeedi/SharhaMuslimJild${volNum}.pdf`;
const pdfDest = path.resolve(__dirname, `../public/pdf/sharah_sahih_muslim_vol${volNum}.pdf`);
const outDir = path.resolve(__dirname, `../public/sharah-muslim/jild-${volNum}`);
const montageDir = path.resolve(__dirname, `../scripts/jild${volNum}_montages`);

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000_000) {
      console.log(`✓ PDF already exists at ${dest} (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(1)} MB)`);
      resolve();
      return;
    }

    console.log(`Downloading Volume ${volNum} PDF from: ${url}`);
    function get(u) {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`Redirecting (${res.statusCode}) -> ${res.headers.location}`);
          get(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
          return;
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        let lastReported = 0;

        const fileStream = fs.createWriteStream(dest);
        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const pct = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
          if (downloadedBytes - lastReported > 8 * 1024 * 1024 || downloadedBytes === totalBytes) {
            lastReported = downloadedBytes;
            console.log(
              `Download progress: ${(downloadedBytes / (1024 * 1024)).toFixed(1)}MB / ${(totalBytes / (1024 * 1024)).toFixed(1)}MB (${pct}%)`
            );
          }
        });

        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Download complete! Saved to ${dest} (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(1)} MB)`);
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

async function generateWebPPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Loading Sharh Sahih Muslim Jild ${volNum} PDF...`);
  const data = new Uint8Array(fs.readFileSync(pdfDest));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Document loaded successfully. Total pages: ${totalPages}`);

  const startTime = Date.now();
  let generatedCount = 0;
  let skippedCount = 0;
  const CONCURRENCY = 6;
  let currentIdx = 1;

  async function worker(workerId) {
    while (currentIdx <= totalPages) {
      const pageNum = currentIdx++;
      const outFile = path.join(outDir, `page_${pageNum}.webp`);

      if (fs.existsSync(outFile)) {
        const s = fs.statSync(outFile);
        if (s.size > 5000) {
          skippedCount++;
          continue;
        }
      }

      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const buf = canvas.toBuffer('image/webp', { quality: 80 });
        fs.writeFileSync(outFile, buf);
        generatedCount++;

        if ((generatedCount + skippedCount) % 50 === 0 || pageNum === totalPages) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const totalDone = generatedCount + skippedCount;
          const rate = (generatedCount / ((Date.now() - startTime) / 1000)).toFixed(1);
          console.log(
            `[Worker] Page ${totalDone}/${totalPages} (${generatedCount} generated, ${skippedCount} skipped, ${elapsed}s, ~${rate} p/s)`
          );
        }
      } catch (err) {
        console.error(`Error generating page ${pageNum}:`, err);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ Finished generating Sharh Sahih Muslim Jild ${volNum} pages! Total: ${totalPages} in ${totalElapsed}s.`);
  return totalPages;
}

async function createHeaderMontage(pages, outPath, title) {
  const images = [];
  for (const p of pages) {
    const imgPath = path.join(outDir, `page_${p}.webp`);
    if (fs.existsSync(imgPath)) {
      const img = await loadImage(imgPath);
      images.push({ page: p, img });
    }
  }

  if (images.length === 0) return;

  const headerH = 120;
  const labelW = 180;
  const canvasW = images[0].img.width + labelW;
  const canvasH = images.length * (headerH + 20) + 60;

  const canvas = createCanvas(canvasW, canvasH);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(title, 20, 35);

  let y = 60;
  for (const { page, img } of images) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(10, y - 5, canvasW - 20, headerH + 10);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`PDF Scan: ${page}`, 20, y + headerH / 2);

    ctx.drawImage(img, 0, 0, img.width, Math.round(img.height * 0.10), labelW, y, img.width, headerH);
    y += headerH + 20;
  }

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  console.log(`Saved montage: ${outPath}`);
}

async function generateInspectionMontages(totalPages) {
  if (!fs.existsSync(montageDir)) {
    fs.mkdirSync(montageDir, { recursive: true });
  }

  // 1. Front matter (1..30)
  const frontPages = Array.from({ length: Math.min(30, totalPages) }, (_, i) => i + 1);
  await createHeaderMontage(
    frontPages.slice(0, 15),
    path.join(montageDir, 'front_1_15.png'),
    `Sharh Muslim Vol ${volNum}: Scans 1..15`
  );
  await createHeaderMontage(
    frontPages.slice(15, 30),
    path.join(montageDir, 'front_16_30.png'),
    `Sharh Muslim Vol ${volNum}: Scans 16..30`
  );

  // 2. Around 100
  if (totalPages >= 110) {
    await createHeaderMontage(
      [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
      path.join(montageDir, 'page_100.png'),
      `Sharh Muslim Vol ${volNum}: Scans around 100`
    );
  }

  // 3. Middle pages
  const mid = Math.floor(totalPages / 2);
  await createHeaderMontage(
    [mid - 5, mid - 4, mid - 3, mid - 2, mid - 1, mid, mid + 1, mid + 2, mid + 3, mid + 4, mid + 5],
    path.join(montageDir, 'page_mid.png'),
    `Sharh Muslim Vol ${volNum}: Scans around ${mid}`
  );

  // 4. End pages
  const endStart = Math.max(1, totalPages - 14);
  const endPages = Array.from({ length: totalPages - endStart + 1 }, (_, i) => endStart + i);
  await createHeaderMontage(
    endPages,
    path.join(montageDir, 'page_end.png'),
    `Sharh Muslim Vol ${volNum}: Scans ${endStart}..${totalPages}`
  );
}

async function main() {
  await downloadFile(pdfUrl, pdfDest);
  const totalPages = await generateWebPPages();
  await generateInspectionMontages(totalPages);
}

main().catch((err) => {
  console.error('Fatal error in volume processing:', err);
  process.exit(1);
});
