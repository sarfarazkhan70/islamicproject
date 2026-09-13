const fs = require('fs');

const timestamps = {
  'prophet-01': { start: 14.2, end: 18.8 },
  'prophet-02': { start: 18.8, end: 23.1 },
  'prophet-03': { start: 41.5, end: 46.2 },
  'prophet-04': { start: 46.2, end: 50.8 },
  'prophet-05': { start: 50.8, end: 55.4 },
  'prophet-06': { start: 69.2, end: 74.5 },
  'prophet-07': { start: 79.0, end: 84.8 },
  'prophet-08': { start: 89.2, end: 94.6 },
  'prophet-09': { start: 94.6, end: 99.4 },
  'prophet-10': { start: 99.4, end: 104.2 },
  'prophet-11': { start: 104.2, end: 109.0 },
  'prophet-12': { start: 109.0, end: 114.5 },
  'prophet-13': { start: 114.5, end: 120.2 },
  'prophet-14': { start: 124.8, end: 129.5 },
  'prophet-15': { start: 129.5, end: 134.5 },
  'prophet-16': { start: 139.2, end: 144.6 },
  'prophet-17': { start: 144.6, end: 150.2 },
  'prophet-18': { start: 150.2, end: 155.0 },
  'prophet-19': { start: 159.6, end: 164.2 },
  'prophet-20': { start: 164.2, end: 169.0 },
  'prophet-21': { start: 169.0, end: 174.0 },
  'prophet-22': { start: 174.0, end: 179.0 },
  'prophet-23': { start: 184.2, end: 190.5 },
  'prophet-24': { start: 195.0, end: 201.8 },
  'prophet-25': { start: 206.5, end: 212.8 },
  'prophet-26': { start: 217.2, end: 223.5 },
  'prophet-27': { start: 228.0, end: 233.8 },
  'prophet-28': { start: 238.5, end: 243.2 },
  'prophet-29': { start: 243.2, end: 248.5 },
  'prophet-30': { start: 253.0, end: 258.0 }
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // First clean any old audioUrl, startTime, endTime, category
  content = content.replace(/\s+audioUrl:\s*'[^']+',/g, '');
  content = content.replace(/\s+startTime:\s*[\d.]+,/g, '');
  content = content.replace(/\s+endTime:\s*[\d.]+,/g, '');
  content = content.replace(/\s+category:\s*'prophet',/g, '');

  // Now inject for each prophet-XX
  for (const [id, t] of Object.entries(timestamps)) {
    const regex = new RegExp("(id:\\s*'" + id + "',)");
    const replacement = `$1\n    category: 'prophet',\n    audioUrl: '/audio/prophet_recitation_male_source.mp3',\n    startTime: ${t.start},\n    endTime: ${t.end},`;
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated with Shaykh Asim Yusuf Male Qari timestamps:', filePath);
}

updateFile('c:/IslamicPrayer/frontend/src/data/islamic/asmaEMustafaData.ts');
updateFile('c:/IslamicPrayer/backend/src/data/islamic/asmaEMustafaData.ts');
