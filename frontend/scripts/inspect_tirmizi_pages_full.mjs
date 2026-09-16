import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Tirmizi Part 1 (340 pages):
// Let's check the printed page numbers:
// PDF 1 = Cover
// PDF 2 = Inner Title
// PDF 3 = Publisher
// PDF 4 = Fihrist (Index 1)
// PDF 5 = Fihrist (Index 2)
// PDF 6 = Printed Page 1 (Abwab al-Taharah start)
// Let's verify what is on PDF 6 to 340:
// If PDF 6 is Printed Page 1, then PDF 340 is Printed Page 335 (340 - 5 = 335).

console.log('PDF total pages: 340');
console.log('Front matter pages (PDF 1 to 5): 5 pages');
console.log('Book text pages (PDF 6 to 340): 335 pages (Printed Pages 1 to 335)');
