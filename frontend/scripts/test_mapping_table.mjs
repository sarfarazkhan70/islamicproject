import fs from 'fs';

// Let's create the complete PDF -> Printed and Printed -> PDF mapping table
// For PDF 1..340:
const pdfToPrinted = {};
const printedToPdf = {};

// PDF 1: Cover (Page 1)
pdfToPrinted[1] = 1;
// PDF 2: Title page (Page 1)
pdfToPrinted[2] = 1;
printedToPdf[1] = 2; // Title page / Page 1

// PDF 3: Page 2 (Copyright)
pdfToPrinted[3] = 2;
printedToPdf[2] = 3;

// PDF 4..14: Printed 3..13
for (let pdf = 4; pdf <= 14; pdf++) {
  const printed = pdf - 1;
  pdfToPrinted[pdf] = printed;
  printedToPdf[printed] = pdf;
}

// For missing range 14..28 (jump between index and main text):
// Map to PDF 15 (page 29)
for (let p = 14; p <= 28; p++) {
  printedToPdf[p] = 15;
}

// PDF 15..339: Printed 29..353
for (let pdf = 15; pdf <= 339; pdf++) {
  const printed = pdf + 14;
  pdfToPrinted[pdf] = printed;
  printedToPdf[printed] = pdf;
}

// PDF 340: Back cover
pdfToPrinted[340] = 353;

console.log('--- TEST MAPPINGS ---');
const testPages = [1, 3, 5, 10, 13, 29, 50, 86, 100, 105, 119, 136, 150, 335, 353];
testPages.forEach(p => {
  const pdf = printedToPdf[p];
  const back = pdfToPrinted[pdf];
  console.log(`Printed Page ${p} -> PDF ${pdf} -> Back to Printed: ${back}`);
});

console.log('\n--- PDF TO PRINTED TEST ---');
[1, 2, 4, 6, 11, 14, 15, 36, 86, 105, 136, 339, 340].forEach(pdf => {
  console.log(`PDF ${pdf} -> Printed ${pdfToPrinted[pdf]}`);
});
