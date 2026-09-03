import fs from 'fs';
import path from 'path';

async function buildCompleteHtml() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Complete Audit of 114 Surahs</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    h1 { color: #10b981; margin-bottom: 4px; }
    p.sub { color: #94a3b8; margin-top: 0; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px; }
    .card { background: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid #334155; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .surah-title { font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .surah-ar { font-size: 18px; color: #34d399; font-family: serif; }
    .badge { background: #059669; color: white; padding: 3px 8px; border-radius: 6px; font-size: 13px; font-weight: 600; }
    .img-box { width: 100%; height: 500px; overflow: hidden; border-radius: 8px; border: 1px solid #475569; background: #fff; }
    .img-box img { width: 100%; display: block; }
  </style>
</head>
<body>
  <h1>Exact 114 Surahs Mapping Audit</h1>
  <p class="sub">Zia-ul-Quran Subcontinent 9-Line Mushaf (quran.pdf - 1124 pages)</p>
  <div class="grid">
`;

  for (const s of surahs) {
    const filename = `surah_${String(s.number).padStart(3, '0')}_p${s.pageStart}_${s.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    html += `
    <div class="card" id="surah-${s.number}">
      <div class="card-header">
        <div>
          <span class="badge">Page ${s.pageStart}</span>
          <span class="surah-title" style="margin-left: 8px;">${s.number}. ${s.name}</span>
        </div>
        <span class="surah-ar">${s.arabicName}</span>
      </div>
      <div class="img-box">
        <img src="surah_audit/${filename}" alt="Surah ${s.number}" loading="lazy" />
      </div>
    </div>
    `;
  }

  html += `
  </div>
</body>
</html>`;

  fs.writeFileSync('complete_114_audit.html', html);
  console.log('Saved complete_114_audit.html');
}

buildCompleteHtml();
