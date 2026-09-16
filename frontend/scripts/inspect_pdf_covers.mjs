import fs from 'fs';
import path from 'path';

async function inspectCovers() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const wasmDir = path.resolve('./public/wasm') + '/';

  for (let v = 1; v <= 7; v++) {
    const pdfPath = path.resolve(`./public/pdf/sharah_sahih_muslim_vol${v}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      console.log(`Vol ${v}: PDF NOT FOUND`);
      continue;
    }
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({
      data,
      wasmUrl: wasmDir,
      cMapUrl: path.resolve('./public/cmaps') + '/',
      standardFontDataUrl: path.resolve('./public/standard_fonts') + '/',
    }).promise;

    const p1 = await doc.getPage(1);
    const vp = p1.getViewport({ scale: 1.0 });
    console.log(`Vol ${v} PDF: totalPages=${doc.numPages}, Page 1 size=${vp.width}x${vp.height}`);
  }
}

inspectCovers().catch(console.error);
