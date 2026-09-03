import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function testPdfGetPage() {
  try {
    const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    console.log('Doc numPages:', doc.numPages);

    for (let p = 1; p <= 10; p++) {
      const page = await doc.getPage(p);
      console.log(`Page ${p}: pageNumber property = ${page.pageNumber}, pageIndex property = ${page._pageIndex}`);
    }
  } catch (err) {
    console.error('Error in testPdfGetPage:', err);
  }
}

testPdfGetPage();
