import fs from 'fs';

async function main() {
  const res = await fetch('https://archive.org/metadata/JamiaTirmiziVolume01Part01');
  const meta = await res.json();
  console.log('Server:', meta.server);
  console.log('Dir:', meta.dir);
  const files = meta.files || [];
  console.log('Total files:', files.length);

  const pdfs = files.filter(f => f.name.endsWith('.pdf'));
  console.log('\nPDF files:');
  pdfs.forEach(p => console.log(' -', p.name, (parseInt(p.size) / 1024 / 1024).toFixed(2), 'MB'));

  const p2Files = files.filter(f => f.name.toLowerCase().includes('part_02') || f.name.toLowerCase().includes('part02'));
  console.log('\nPart 2 related files:');
  p2Files.forEach(f => console.log(' -', f.name, `[${f.format}]`, (parseInt(f.size || '0') / 1024 / 1024).toFixed(2), 'MB'));
}

main().catch(console.error);
