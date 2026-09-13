import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkSpecificPages() {
  const vDir = path.resolve('verification');
  // Check An-Am, At-Tawbah, Al-Kahf, Maryam, Taha, etc.
  const checks = [
    { num: 6, folder: '006-Al-Anam', pages: [238, 239, 240] },
    { num: 9, folder: '009-At-Tawbah', pages: [347, 348, 349] },
    { num: 18, folder: '018-Al-Kahf', pages: [541, 542, 543] },
    { num: 19, folder: '019-Maryam', pages: [563, 564, 565] },
    { num: 20, folder: '020-Taha', pages: [576, 577, 578] },
    { num: 22, folder: '022-Al-Hajj', pages: [613, 614, 615] },
    { num: 24, folder: '024-An-Nur', pages: [647, 648, 649] },
    { num: 26, folder: '026-Ash-Shuara', pages: [677, 678, 679] },
    { num: 27, folder: '027-An-Naml', pages: [696, 697, 698] },
    { num: 32, folder: '032-As-Sajdah', pages: [765, 766, 767] },
    { num: 33, folder: '033-Al-Ahzab', pages: [771, 772, 773] },
    { num: 34, folder: '034-Saba', pages: [789, 790, 791] },
    { num: 37, folder: '037-As-Saffat', pages: [823, 824, 825] },
    { num: 41, folder: '041-Fussilat', pages: [881, 882, 883] },
    { num: 47, folder: '047-Muhammad', pages: [937, 938, 939] },
    { num: 48, folder: '048-Al-Fath', pages: [945, 946, 947] },
    { num: 49, folder: '049-Al-Hujurat', pages: [953, 954, 955] },
    { num: 52, folder: '052-At-Tur', pages: [970, 971, 972] },
    { num: 54, folder: '054-Al-Qamar', pages: [979, 980, 981] },
    { num: 58, folder: '058-Al-Mujadila', pages: [1003, 1004, 1005] },
    { num: 75, folder: '075-Al-Qiyamah', pages: [1072, 1073, 1074] },
    { num: 83, folder: '083-Al-Mutaffifin', pages: [1097, 1098, 1099] },
    { num: 84, folder: '084-Al-Inshiqaq', pages: [1098, 1099, 1100] },
    { num: 85, folder: '085-Al-Buruj', pages: [1100, 1101, 1102] },
    { num: 86, folder: '086-At-Tariq', pages: [1101, 1102, 1103] },
    { num: 90, folder: '090-Al-Balad', pages: [1110, 1111, 1112] },
    { num: 91, folder: '091-Ash-Shams', pages: [1111, 1112, 1113] },
    { num: 92, folder: '092-Al-Layl', pages: [1112, 1113, 1114] },
    { num: 93, folder: '093-Ad-Duha', pages: [1113, 1114, 1115] },
    { num: 94, folder: '094-Ash-Sharh', pages: [1114, 1115, 1116] },
    { num: 95, folder: '095-At-Tin', pages: [1115, 1116, 1117] },
    { num: 96, folder: '096-Al-Alaq', pages: [1116, 1117, 1118] },
    { num: 97, folder: '097-Al-Qadr', pages: [1117, 1118, 1119] },
    { num: 98, folder: '098-Al-Bayyinah', pages: [1117, 1118, 1119] },
    { num: 99, folder: '099-Az-Zalzalah', pages: [1118, 1119, 1120] },
    { num: 100, folder: '100-Al-Adiyat', pages: [1119, 1120, 1121] },
    { num: 101, folder: '101-Al-Qariah', pages: [1119, 1120, 1121] },
    { num: 102, folder: '102-At-Takathur', pages: [1120, 1121, 1122] },
    { num: 103, folder: '103-Al-Asr', pages: [1120, 1121, 1122] },
    { num: 104, folder: '104-Al-Humazah', pages: [1121, 1122, 1123] },
    { num: 105, folder: '105-Al-Fil', pages: [1121, 1122, 1123] },
    { num: 106, folder: '106-Quraysh', pages: [1121, 1122, 1123] },
    { num: 107, folder: '107-Al-Maun', pages: [1122, 1123, 1124] },
    { num: 108, folder: '108-Al-Kawthar', pages: [1122, 1123, 1124] },
    { num: 109, folder: '109-Al-Kafirun', pages: [1122, 1123, 1124] },
    { num: 110, folder: '110-An-Nasr', pages: [1122, 1123, 1124] },
    { num: 111, folder: '111-Al-Masad', pages: [1122, 1123, 1124] },
    { num: 112, folder: '112-Al-Ikhlas', pages: [1122, 1123, 1124] },
    { num: 113, folder: '113-Al-Falaq', pages: [1122, 1123, 1124] },
    { num: 114, folder: '114-An-Nas', pages: [1122, 1123, 1124] },
  ];

  console.log(`Checking ${checks.length} specific candidate pages...`);
}

checkSpecificPages().catch(console.error);
