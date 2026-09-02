const fs = require('fs');

function updateDataFiles() {
  const files = [
    'c:/IslamicPrayer/frontend/src/data/islamic/asmaEMustafaData.ts',
    'c:/IslamicPrayer/backend/src/data/islamic/asmaEMustafaData.ts'
  ];

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Clean old fields
    content = content.replace(/\s+audioUrl:\s*'[^']+',/g, '');
    content = content.replace(/\s+startTime:\s*[\d.]+,/g, '');
    content = content.replace(/\s+endTime:\s*[\d.]+,/g, '');
    content = content.replace(/\s+category:\s*'prophet',/g, '');

    for (let i = 1; i <= 30; i++) {
      const id = `prophet-${String(i).padStart(2, '0')}`;
      const regex = new RegExp("(id:\\s*'" + id + "',)");
      const replacement = `$1\n    category: 'prophet',\n    audioUrl: '/audio/prophet/${id}.wav',`;
      content = content.replace(regex, replacement);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated standalone audioUrl in:', filePath);
  }
}

updateDataFiles();
