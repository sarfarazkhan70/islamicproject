import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFilteredOps() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
  const scratchDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/28908bcb-6f74-44ee-82d0-ffbe955075b0/scratch';

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: path.resolve(__dirname, '../public/wasm') + '/',
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const testPages = [1, 2, 5, 10, 100, 200, 453];

  for (const pNum of testPages) {
    const page = await doc.getPage(pNum);
    const ops = await page.getOperatorList();
    
    const opNames = Object.entries(pdfjs.OPS).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});
    
    console.log(`Page ${pNum} operators count before: ${ops.fnArray.length}`);
    
    const newFnArray = [];
    const newArgsArray = [];
    let skippingAnnotation = false;
    let skippingText = false;
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      const name = opNames[fn] || fn;
      
      if (name === 'beginAnnotation') {
        skippingAnnotation = true;
        continue;
      }
      if (name === 'endAnnotation') {
        skippingAnnotation = false;
        continue;
      }
      if (skippingAnnotation) continue;
      
      if (name === 'beginText') {
        skippingText = true;
        continue;
      }
      if (name === 'endText') {
        skippingText = false;
        continue;
      }
      if (skippingText) continue;
      
      if (name === 'showText' || name === 'showSpacedText') continue;
      
      newFnArray.push(fn);
      newArgsArray.push(ops.argsArray[i]);
    }
    
    ops.fnArray = newFnArray;
    ops.argsArray = newArgsArray;
    console.log(`Page ${pNum} operators count after: ${ops.fnArray.length}`);

    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    page.getOperatorList = async () => ops;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const buf = canvas.toBuffer('image/jpeg', { quality: 85 });
    fs.writeFileSync(path.join(scratchDir, `filtered_page_${pNum}.jpg`), buf);
  }
  console.log('Filtered pages written to scratch');
}

testFilteredOps().catch(console.error);
