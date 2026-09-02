const fs = require('fs');

const verifiedTimestamps = {
  'prophet-01': { start: 14.2, end: 19.0 },  // Sayyiduna Muhammad
  'prophet-02': { start: 19.0, end: 23.5 },  // Sayyiduna Ahmad
  'prophet-03': { start: 41.5, end: 46.2 },  // Sayyiduna Mahin (Al-Mahi)
  'prophet-04': { start: 46.2, end: 50.8 },  // Sayyiduna Hashir (Al-Hashir)
  'prophet-05': { start: 50.8, end: 55.4 },  // Sayyiduna Aqib (Al-Aqib)
  'prophet-06': { start: 168.0, end: 173.2 }, // Sayyiduna Khatam al-Anbiya (Khatam an-Nabiyyin)
  'prophet-07': { start: 94.0, end: 99.2 },   // Sayyiduna Rasul ur-Rahmah (Rahmatun lil-Alamin)
  'prophet-08': { start: 89.2, end: 94.0 },   // Sayyiduna Nabi (An-Nabi al-Ummi)
  'prophet-09': { start: 224.2, end: 229.0 }, // Sayyiduna Shahid (Ash-Shahid)
  'prophet-10': { start: 242.0, end: 247.0 }, // Sayyiduna Mubashshir (Al-Mubashshir)
  'prophet-11': { start: 247.0, end: 252.0 }, // Sayyiduna Nadhir (An-Nadhir)
  'prophet-12': { start: 286.0, end: 291.5 }, // Sayyiduna Da'in (Ad-Da'i ila Allah)
  'prophet-13': { start: 261.0, end: 266.5 }, // Sayyiduna Siraj (As-Siraj al-Munir)
  'prophet-14': { start: 139.8, end: 144.5 }, // Sayyiduna Muzzammil (Al-Muzzammil)
  'prophet-15': { start: 135.0, end: 139.8 }, // Sayyiduna Muddaththir (Al-Muddaththir)
  'prophet-16': { start: 200.0, end: 205.0 }, // Sayyiduna Nabiyy ur-Rahmah (Nabiyy-ur-Rahmah)
  'prophet-17': { start: 205.0, end: 210.2 }, // Sayyiduna Nabiyy ut-Tawbah (Nabiyy-ut-Tawbah)
  'prophet-18': { start: 296.0, end: 301.0 }, // Sayyiduna Mutawakkil (Al-Mutawakkil)
  'prophet-19': { start: 315.0, end: 319.8 }, // Sayyiduna Amin (Al-Amin)
  'prophet-20': { start: 319.8, end: 324.5 }, // Sayyiduna Sadiq (As-Sadiq)
  'prophet-21': { start: 324.5, end: 329.5 }, // Sayyiduna Mustafa (Al-Mustafa)
  'prophet-22': { start: 329.5, end: 334.5 }, // Sayyiduna Mukhtar (Al-Mukhtar)
  'prophet-23': { start: 79.5, end: 84.5 },   // Sayyiduna Sayyid (Sayyid Walad Adam)
  'prophet-24': { start: 28.0, end: 32.8 },   // Sayyiduna Mahmud (Sahib al-Maqam al-Mahmud)
  'prophet-25': { start: 344.0, end: 349.5 }, // Sayyiduna Sahib ul-Kawthar (Sahib al-Kawthar)
  'prophet-26': { start: 349.5, end: 354.5 }, // Sayyiduna Shafi' (Shafi' al-Mudhnibin)
  'prophet-27': { start: 210.2, end: 215.2 }, // Sayyiduna Harisun 'Alaykum / Ra'uf (Ra'ufun Rahim)
  'prophet-28': { start: 271.0, end: 276.0 }, // Sayyiduna Hadi (Al-Hadi)
  'prophet-29': { start: 186.0, end: 191.0 }, // Sayyiduna Mudhakkir (Al-Mudhakkir)
  'prophet-30': { start: 364.0, end: 369.0 }  // Sayyiduna Qasim (Al-Qasim)
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\s+audioUrl:\s*'[^']+',/g, '');
  content = content.replace(/\s+startTime:\s*[\d.]+,/g, '');
  content = content.replace(/\s+endTime:\s*[\d.]+,/g, '');
  content = content.replace(/\s+category:\s*'prophet',/g, '');

  for (const [id, t] of Object.entries(verifiedTimestamps)) {
    const regex = new RegExp("(id:\\s*'" + id + "',)");
    const replacement = `$1\n    category: 'prophet',\n    audioUrl: '/audio/prophet_recitation_male_source.mp3',\n    startTime: ${t.start},\n    endTime: ${t.end},`;
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated with verified exact Dala\'il al-Khayrat timestamps:', filePath);
}

updateFile('c:/IslamicPrayer/frontend/src/data/islamic/asmaEMustafaData.ts');
updateFile('c:/IslamicPrayer/backend/src/data/islamic/asmaEMustafaData.ts');
