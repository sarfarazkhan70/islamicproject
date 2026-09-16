import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Tirmizi Part 1:
// Total PDF pages = 340
// Front matter = 5 pages (PDF 1 to 5)
// Text pages = PDF 6 to 340 -> Printed pages 1 to 335
// Let's verify mapping functions:

export function getTirmiziPrintedPage(partNum = 1, pdfPage) {
  if (partNum === 1) {
    if (pdfPage <= 5) return Math.max(1, pdfPage);
    return Math.max(1, Math.min(335, pdfPage - 5));
  }
  return Math.max(1, pdfPage);
}

export function getTirmiziPdfPage(partNum = 1, printedPage) {
  if (partNum === 1) {
    if (printedPage === 1) return 6; // Main text page 1 starts at PDF 6
    return Math.max(1, Math.min(340, printedPage + 5));
  }
  return Math.max(1, printedPage);
}

console.log('Test mappings for Tirmizi Part 1:');
console.log('Printed 1 -> PDF', getTirmiziPdfPage(1, 1));
console.log('Printed 50 -> PDF', getTirmiziPdfPage(1, 50));
console.log('Printed 100 -> PDF', getTirmiziPdfPage(1, 100));
console.log('Printed 200 -> PDF', getTirmiziPdfPage(1, 200));
console.log('Printed 335 -> PDF', getTirmiziPdfPage(1, 335));

console.log('PDF 1 -> Printed', getTirmiziPrintedPage(1, 1));
console.log('PDF 5 -> Printed', getTirmiziPrintedPage(1, 5));
console.log('PDF 6 -> Printed', getTirmiziPrintedPage(1, 6));
console.log('PDF 55 -> Printed', getTirmiziPrintedPage(1, 55));
console.log('PDF 105 -> Printed', getTirmiziPrintedPage(1, 105));
console.log('PDF 340 -> Printed', getTirmiziPrintedPage(1, 340));
