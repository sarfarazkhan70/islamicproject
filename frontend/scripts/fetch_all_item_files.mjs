import https from 'https';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const meta = await getJson('https://archive.org/metadata/SharahSahihMuslimUrduByAllamaGhulamRasoolSaeedi');
  for (const f of meta.files || []) {
    if (f.name.endsWith('.pdf') || f.name.endsWith('.jpg') || f.name.endsWith('.png')) {
      console.log(f.name, f.size);
    }
  }
}

main().catch(console.error);
