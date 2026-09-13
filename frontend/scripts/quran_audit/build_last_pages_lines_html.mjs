import fs from 'fs';
import path from 'path';

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pages 1118-1124 Line-by-Line Review</title>
  <style>
    body { font-family: sans-serif; background: #222; color: #fff; padding: 20px; }
    .page-box { margin-bottom: 30px; background: #333; padding: 15px; border-radius: 8px; }
    .line-row { display: flex; align-items: center; margin-bottom: 6px; }
    .line-num { width: 60px; font-weight: bold; }
    .line-img { max-width: 800px; background: white; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Pages 1118 to 1124 - All 9 Lines Breakdown</h1>
`;

for (let p = 1118; p <= 1124; p++) {
  html += `<div class="page-box"><h2>PDF Page ${p}</h2>`;
  for (let l = 1; l <= 9; l++) {
    const filename = `p${p}_line${l}.png`;
    html += `
    <div class="line-row">
      <div class="line-num">Line ${l}:</div>
      <img class="line-img" src="last_surahs_crops/${filename}" alt="P${p} L${l}" />
    </div>`;
  }
  html += `</div>`;
}

html += `</body></html>`;
fs.writeFileSync('last_pages_lines_audit.html', html);
console.log('Saved last_pages_lines_audit.html');
