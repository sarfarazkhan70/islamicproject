import fs from 'fs';

const TIRMIZI_VOL2_PDF_TO_PRINTED = new Array(376);
const TIRMIZI_VOL2_PRINTED_TO_PDF = new Array(716);

// PDF to Printed
TIRMIZI_VOL2_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL2_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL2_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 12; pdf++) {
  TIRMIZI_VOL2_PDF_TO_PRINTED[pdf] = pdf + 9; // PDF 4..12 -> 13..21
}
for (let pdf = 13; pdf <= 374; pdf++) {
  TIRMIZI_VOL2_PDF_TO_PRINTED[pdf] = pdf + 341; // PDF 13..374 -> 354..715
}
TIRMIZI_VOL2_PDF_TO_PRINTED[375] = 715;

// Printed to PDF
TIRMIZI_VOL2_PRINTED_TO_PDF[1] = 2; // Title page
TIRMIZI_VOL2_PRINTED_TO_PDF[2] = 3;
for (let p = 3; p <= 12; p++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[p] = 4; // Map early front pages to start of Fihrist
}
for (let p = 13; p <= 21; p++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[p] = p - 9; // Fihrist 13..21 -> PDF 4..12
}
for (let p = 22; p <= 353; p++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[p] = 13; // Gap between index and main text -> PDF 13 (Page 354)
}
for (let p = 354; p <= 715; p++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[p] = p - 341; // Main text 354..715 -> PDF 13..374
}

console.log('--- VOL 2 MAPPING VERIFICATION ---');
const samplePages = [1, 13, 15, 21, 354, 355, 360, 400, 450, 500, 550, 600, 650, 700, 715];
samplePages.forEach(p => {
  const pdf = TIRMIZI_VOL2_PRINTED_TO_PDF[p];
  const back = TIRMIZI_VOL2_PDF_TO_PRINTED[pdf];
  console.log(`Printed ${p} -> PDF ${pdf} -> Back to Printed: ${back}`);
});

console.log('\n--- PDF TO PRINTED VERIFICATION ---');
[1, 2, 4, 12, 13, 59, 159, 374, 375].forEach(pdf => {
  console.log(`PDF ${pdf} -> Printed ${TIRMIZI_VOL2_PDF_TO_PRINTED[pdf]}`);
});
