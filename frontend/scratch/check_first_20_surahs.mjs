import fs from 'fs';
import path from 'path';

// Let's check the exact page numbers from our images in scratch/surah_header_crops/
const checkPages = [
  { s: 1, name: 'Al-Fatihah', pages: [3] },
  { s: 2, name: 'Al-Baqarah', pages: [4] },
  { s: 3, name: 'Ali Imran', pages: [91, 92] },
  { s: 4, name: 'An-Nisa', pages: [144, 145] },
  { s: 5, name: 'Al-Maidah', pages: [195, 196, 197] },
  { s: 6, name: 'Al-Anam', pages: [238, 239, 240] },
  { s: 7, name: 'Al-Araf', pages: [279, 280, 281] },
  { s: 8, name: 'Al-Anfal', pages: [328, 329, 330] },
  { s: 9, name: 'At-Tawbah', pages: [348, 349, 350] },
  { s: 10, name: 'Yunus', pages: [385, 386, 387] },
  { s: 11, name: 'Hud', pages: [408, 409, 411] },
  { s: 12, name: 'Yusuf', pages: [434, 435, 436] },
  { s: 13, name: 'Ar-Rad', pages: [460, 461, 462] },
  { s: 14, name: 'Ibrahim', pages: [471, 472, 473] },
  { s: 15, name: 'Al-Hijr', pages: [484, 485, 486] },
  { s: 16, name: 'An-Nahl', pages: [493, 494, 495] },
  { s: 17, name: 'Al-Isra', pages: [521, 522, 523] },
  { s: 18, name: 'Al-Kahf', pages: [542, 543, 544] },
  { s: 19, name: 'Maryam', pages: [563, 564, 565] },
  { s: 20, name: 'Taha', pages: [576, 577, 578] }
];

console.log('List of checks ready');
