import fs from 'fs';
import path from 'path';

let html = `<!DOCTYPE html>
<html>
<head><title>Page Strips</title><style>body{background:#222;color:#fff;font-family:sans-serif;padding:20px;} img{border:1px solid #fff;background:#fff;margin-bottom:15px;display:block;max-width:800px;}</style></head>
<body>
<h1>Corner and Strip Inspection</h1>
`;

const files = fs.readdirSync('corner_crops').filter(f => f.endsWith('.png')).sort();
for (const f of files) {
  html += `<h3>${f}</h3><img src="corner_crops/${f}" alt="${f}" />`;
}

html += `</body></html>`;
fs.writeFileSync('view_corner_crops.html', html);
console.log('Saved view_corner_crops.html');
