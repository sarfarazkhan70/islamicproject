import fs from 'fs';
import { SURAHS_LIST, JUZ_LIST } from '../src/data/quranData.ts';

// Let's inspect the exact page numbers in SURAHS_LIST:
// Notice: In standard Zia-ul-Quran Mushaf, let's verify Juz start pages:
// Juz 1: Page 3 (Cover 1, Title 2, Fatihah 3, Baqarah 4)
// Juz 2: Page 41 (Cover 40, Page 41)
// Juz 3: Page 78 (Cover 77, Page 78)
// Juz 4: Page 115 (Cover 114, Page 115)
// Juz 5: Page 152 (Cover 151, Page 152)
// Juz 6: Page 189 (Cover 188, Page 189)
// Juz 7: Page 226 (Cover 225, Page 226)
// Juz 8: Page 263 (Cover 262, Page 263)
// Juz 9: Page 300 (Cover 299, Page 300)
// Juz 10: Page 337 (Cover 336, Page 337)
// Juz 11: Page 374 (Cover 373, Page 374)
// Juz 12: Page 411 (Cover 410, Page 411)
// Juz 13: Page 448 (Cover 447, Page 448)
// Juz 14: Page 485 (Cover 484, Page 485)
// Juz 15: Page 522 (Cover 521, Page 522)
// Juz 16: Page 559 (Cover 558, Page 559)
// Juz 17: Page 596 (Cover 595, Page 596)
// Juz 18: Page 633 (Cover 632, Page 633)
// Juz 19: Page 670 (Cover 669, Page 670)
// Juz 20: Page 707 (Cover 706, Page 707)
// Juz 21: Page 744 (Cover 743, Page 744)
// Juz 22: Page 781 (Cover 780, Page 781)
// Juz 23: Page 818 (Cover 817, Page 818)
// Juz 24: Page 855 (Cover 854, Page 855)
// Juz 25: Page 892 (Cover 891, Page 892)
// Juz 26: Page 929 (Cover 928, Page 929)
// Juz 27: Page 966 (Cover 965, Page 966)
// Juz 28: Page 1003 (Cover 1002, Page 1003)
// Juz 29: Page 1044 (Cover 1043, Page 1044)
// Juz 30: Page 1085 (Cover 1084, Page 1085)

console.log('Juz list total:', JUZ_LIST.length);
