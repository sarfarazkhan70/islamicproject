import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function cropPageHeaders() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const testPages = [
    { page: 3, label: 'Al-Fatihah_3' },
    { page: 4, label: 'Al-Baqarah_4' },
    { page: 92, label: 'Aal-e-Imran_92' },
    { page: 542, label: 'Al-Kahf_542' },
    { page: 543, label: 'Al-Kahf_543' },
    { page: 812, label: 'Ya-Sin_812' },
    { page: 814, label: 'Ya-Sin_814' },
    { page: 982, label: 'Ar-Rahman_982' },
    { page: 985, label: 'Ar-Rahman_985' },
    { page: 1044, label: 'Al-Mulk_1044' },
    { page: 1123, label: 'An-Nas_1123' }
  ];

  const outDir = path.resolve('scratch/visual_check');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const t of testPages) {
    const page = await doc.getPage(t.page);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const canvas = createCanvas(img.width, img.height);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(img.width, img.height);
              let src = 0;
              let dst = 0;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  imgData.data[dst] = img.data[src];
                  imgData.data[dst + 1] = img.data[src + 1];
                  imgData.data[dst + 2] = img.data[src + 2];
                  imgData.data[dst + 3] = 255;
                  src += 3;
                  dst += 4;
                }
              }
              ctx.putImageData(imgData, 0, 0);
              fs.writeFileSync(path.join(outDir, `${t.label}.png`), canvas.toBuffer('image/png'));
            }
            resolve();
          });
        });
        break;
      }
    }
  }
  console.log('Saved visual crops to scratch/visual_check');
}

cropPageHeaders().catch(console.error);
