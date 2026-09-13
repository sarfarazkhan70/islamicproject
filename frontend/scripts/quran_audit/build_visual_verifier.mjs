import fs from 'fs';
import path from 'path';

async function buildHtmlReport() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Surah Mapping Audit (114 Surahs)</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { background: #222; border-radius: 8px; padding: 12px; border: 1px solid #444; }
    .card h3 { margin: 0 0 8px 0; color: #10b981; font-size: 16px; }
    .card img { width: 100%; border-radius: 4px; border: 1px solid #555; background: #fff; }
    .meta { font-size: 13px; color: #aaa; margin-bottom: 8px; }
    .badge { background: #059669; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Audit of 114 Surahs vs PDF Pages (Zia-ul-Quran 9-Line Mushaf)</h1>
  <p>Verifying exact starting page of every Surah</p>
  <div class="grid">
`;

  for (const s of surahs) {
    const filename = `surah_${String(s.number).padStart(3, '0')}_p${s.pageStart}_${s.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const relPath = path.join('surah_audit', filename);
    html += `
    <div class="card">
      <h3>${s.number}. ${s.name} (${s.arabicName})</h3>
      <div class="meta">
        <span class="badge">Page ${s.pageStart}</span> • Juz ${s.juzStart} • ${s.versesCount} Verses
      </div>
      <img src="${relPath}" alt="Surah ${s.number} on Page ${s.pageStart}" loading="lazy" />
    </div>
    `;
  }

  html += `
  </div>
</body>
</html>`;

  fs.writeFileSync('surah_audit_report.html', html);
  console.log('Written surah_audit_report.html');
}

buildHtmlReport();
