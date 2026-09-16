import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

for (let v = 1; v <= 7; v++) {
  const p = path.resolve(`./public/sharah-muslim/jild-${v}/page_1.webp`);
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    console.log(`Jild ${v} page_1.webp: size=${buf.length}, hash=${hash}`);
  }
}
