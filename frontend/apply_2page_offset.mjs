import fs from 'fs';
import path from 'path';

// Physical verified start pages for all 114 Surahs
const PHYSICAL_PAGES = [
  3, 4, 92, 144, 197, 240, 280, 329, 349, 386,
  409, 435, 461, 472, 485, 494, 522, 543, 564, 577,
  596, 614, 633, 649, 664, 679, 697, 712, 731, 746,
  759, 767, 772, 790, 801, 812, 825, 837, 846, 863,
  882, 893, 904, 917, 923, 929, 939, 946, 954, 960,
  966, 971, 976, 980, 985, 991, 997, 1004, 1010, 1016,
  1021, 1024, 1026, 1028, 1032, 1035, 1044, 1048, 1051, 1053,
  1060, 1062, 1065, 1067, 1073, 1077, 1081, 1085, 1088, 1090,
  1092, 1094, 1098, 1099, 1101, 1102, 1106, 1107, 1109, 1111,
  1112, 1113, 1114, 1115, 1116, 1117, 1118, 1118, 1119, 1120,
  1120, 1121, 1121, 1122, 1122, 1122, 1123, 1123, 1123, 1123,
  1123, 1123, 1123, 1123
];

// Physical start pages for 30 Juz
const PHYSICAL_JUZ_PAGES = [
  3, 41, 78, 115, 152, 189, 226, 263, 300, 337,
  374, 411, 448, 485, 522, 559, 596, 633, 670, 707,
  744, 781, 818, 855, 892, 929, 966, 1003, 1044, 1085
];

// With 2 extra initial cover/preface pages:
// Page 1 = Physical Page 3
// Surah pageStart = physicalPage - 2
const OFFSET = 2;

const quranDataPath = path.resolve('src/data/quranData.ts');
let content = fs.readFileSync(quranDataPath, 'utf8');

// Update SURAHS_LIST in quranData.ts
for (let i = 0; i < PHYSICAL_PAGES.length; i++) {
  const surahNum = i + 1;
  const newPage = PHYSICAL_PAGES[i] - OFFSET;
  
  // Regex to match "number": X, ... "pageStart": Y
  const regex = new RegExp(`(\"number\":\\s*${surahNum},[\\s\\S]*?\"pageStart\":\\s*)\\d+`, 'm');
  content = content.replace(regex, `$1${newPage}`);
}

// Update JUZ_LIST in quranData.ts
for (let j = 0; j < PHYSICAL_JUZ_PAGES.length; j++) {
  const juzNum = j + 1;
  const newJuzPage = PHYSICAL_JUZ_PAGES[j] - OFFSET;
  const regex = new RegExp(`(\"number\":\\s*${juzNum},[\\s\\S]*?\"pageStart\":\\s*)\\d+`, 'm');
  content = content.replace(regex, `$1${newJuzPage}`);
}

// Update TOTAL_MUSHAF_PDF_PAGES and add PDF_START_OFFSET
content = content.replace(/export const TOTAL_MUSHAF_PDF_PAGES\s*=\s*\d+;/, 'export const TOTAL_MUSHAF_PDF_PAGES = 1122;\nexport const PDF_PHYSICAL_TOTAL_PAGES = 1124;\nexport const PDF_INITIAL_COVER_OFFSET = 2;');

fs.writeFileSync(quranDataPath, content);
console.log('Successfully updated quranData.ts with start offset (Page 1 = PDF Page 3)!');
