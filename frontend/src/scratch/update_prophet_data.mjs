import fs from 'fs';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (let i = 1; i <= 30; i++) {
    const id = 'prophet-' + String(i).padStart(2, '0');
    const audioUrl = `/audio/prophet/${id}.mp3`;

    // Ensure audioUrl is present on this item
    const target = `id: '${id}',`;
    const targetIdx = content.indexOf(target);
    if (targetIdx !== -1) {
      const blockEnd = content.indexOf('},', targetIdx);
      const block = content.slice(targetIdx, blockEnd);

      if (!block.includes('audioUrl:')) {
        const insertPoint = content.indexOf(`category: 'prophet',`, targetIdx);
        if (insertPoint !== -1 && insertPoint < blockEnd) {
          content =
            content.slice(0, insertPoint) +
            `audioUrl: '${audioUrl}',\n    ` +
            content.slice(insertPoint);
        }
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated:', filePath);
}

updateFile('c:/IslamicPrayer/frontend/src/data/islamic/asmaEMustafaData.ts');
updateFile('c:/IslamicPrayer/backend/src/data/islamic/asmaEMustafaData.ts');
