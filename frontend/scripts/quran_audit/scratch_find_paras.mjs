import fs from 'fs';
import path from 'path';

const outDir = path.resolve('para_test_images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadLeaf(leaf) {
  const url = `https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n${leaf}_w800.jpg`;
  const dest = path.join(outDir, `leaf_${leaf}.jpg`);
  if (fs.existsSync(dest)) return dest;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      console.log(`Failed leaf ${leaf}: HTTP ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`Downloaded leaf ${leaf}`);
    return dest;
  } catch (e) {
    console.error(`Error leaf ${leaf}:`, e.message);
    return null;
  }
}

// Let's check candidates for all 30 Paras
// Para 1: Page 2 (Leaf 3) -> VERIFIED (Surah Al-Fatihah)
// Para 2: Candidates around page 46-50 (Leaves 47-51)
// Para 3: Page 87 (Leaf 88) -> VERIFIED (2:253 Tilkal Rusul)
// Para 4: Candidates around page 120-126 (Leaves 121-127)
// Para 5: Candidates around page 158-164 (Leaves 159-165)
// Para 6: Candidates around page 194-200 (Leaves 195-201)
// Para 7: Candidates around page 225-231 (Leaves 226-232)
// Para 8: Candidates around page 266-272 (Leaves 267-273)
// Para 9: Candidates around page 300-306 (Leaves 301-307)
// Para 10: Candidates around page 340-346 (Leaves 341-347)
// Para 11: Candidates around page 370-376 (Leaves 371-377)
// Para 12: Candidates around page 416-420 (Leaves 417-421)
// Para 13: Candidates around page 448-454 (Leaves 449-455)
// Para 14: Candidates around page 488-490 (Leaves 489-491)
// Para 15: Page 525 (Leaf 526) -> VERIFIED (Surah 17:1)
// Para 16: Candidates around page 560-565 (Leaves 561-566)
// Para 17: Page 601 (Leaf 602) -> VERIFIED (Surah 21:1)
// Para 18: Page 634 (Leaf 635) -> VERIFIED (Surah 23:1)
// Para 19: Candidates around page 668-672 (Leaves 669-673)
// Para 20: Candidates around page 705-710 (Leaves 706-711)
// Para 21: Candidates around page 742-746 (Leaves 743-747)
// Para 22: Candidates around page 778-782 (Leaves 779-783)
// Para 23: Candidates around page 816-820 (Leaves 817-821)
// Para 24: Candidates around page 852-856 (Leaves 853-857)
// Para 25: Candidates around page 884-888 (Leaves 885-889)
// Para 26: Page 923 (Leaf 924) -> VERIFIED (Surah 46:1)
// Para 27: Candidates around page 962-966 (Leaves 963-967)
// Para 28: Page 1001 (Leaf 1002) -> VERIFIED (Surah 58:1)
// Para 29: Page 1040 (Leaf 1041) -> VERIFIED (Surah 67:1)
// Para 30: Page 1080 (Leaf 1081) -> VERIFIED (Surah 78:1)

async function main() {
  console.log('Starting targeted search for Para beginnings...');
}
main();
