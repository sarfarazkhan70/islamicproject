import { HADAIQ_KALAMS_INDEX } from '../src/data/hadaiqData.ts';

console.log(`Total kalams in index: ${HADAIQ_KALAMS_INDEX.length}`);
let mismatches = 0;
for (const k of HADAIQ_KALAMS_INDEX) {
  const expectedPrinted = k.pdfPage >= 7 ? k.pdfPage - 6 : 1;
  if (k.printedPage !== expectedPrinted) {
    console.log(`Mismatch in kalam "${k.title}": pdfPage=${k.pdfPage}, printedPage=${k.printedPage}, expected=${expectedPrinted}`);
    mismatches++;
  }
}
console.log(`Total mismatches: ${mismatches}`);
