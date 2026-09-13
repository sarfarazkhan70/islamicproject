import fs from 'fs';
import path from 'path';

const tripletResults = JSON.parse(fs.readFileSync('exact_triplet_results.json', 'utf8'));

// We can build an HTML that displays for each Surah:
// Folder name, the chosen page, and all 3 images with the winner highlighted!
let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>114 Surah Final Visual Audit</title>
  <style>
    body { background: #111; color: #eee; font-family: sans-serif; margin: 0; padding: 20px; }
    .surah-card { background: #1e1e1e; border: 1px solid #333; border-radius: 8px; margin-bottom: 24px; padding: 16px; }
    .surah-header { font-size: 1.2rem; font-weight: bold; margin-bottom: 12px; color: #10b981; }
    .images-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .img-box { border: 2px solid #444; border-radius: 6px; overflow: hidden; background: #000; text-align: center; }
    .img-box.winner { border-color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
    .img-box img { width: 100%; display: block; }
    .img-label { padding: 6px; font-size: 0.9rem; font-weight: bold; background: #222; }
    .img-box.winner .img-label { background: #064e3b; color: #34d399; }
  </style>
</head>
<body>
  <h1>114 Surahs - Exact Visual Starting Page Audit</h1>
`;

const vDir = path.resolve('verification');
const dirs = fs.readdirSync(vDir).filter(d => fs.statSync(path.join(vDir, d)).isDirectory()).sort();

for (const dir of dirs) {
  const surahNum = parseInt(dir.split('-')[0], 10);
  const surahName = dir.substring(4);
  const winnerObj = tripletResults.find(t => t.surahNum === surahNum);
  const winPage = winnerObj ? winnerObj.physicalPdfPage : 2;

  html += `
  <div class="surah-card">
    <div class="surah-header">Surah ${surahNum}. ${surahName} (Physical PDF Page: ${winPage})</div>
    <div class="images-grid">
  `;

  const files = fs.readdirSync(path.join(vDir, dir)).filter(f => f.endsWith('.png')).sort((a,b) => {
    return parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10);
  });

  for (const f of files) {
    const pageNum = parseInt(f.replace(/\D/g, ''), 10);
    const isWinner = pageNum === winPage;
    html += `
      <div class="img-box ${isWinner ? 'winner' : ''}">
        <div class="img-label">PDF Page ${pageNum} ${isWinner ? '★ WINNER (START)' : ''}</div>
        <img src="verification/${dir}/${f}" alt="Page ${pageNum}" loading="lazy" />
      </div>
    `;
  }

  html += `
    </div>
  </div>
  `;
}

html += `</body></html>`;
fs.writeFileSync('final_surah_visual_audit.html', html);
console.log('Saved final_surah_visual_audit.html');
