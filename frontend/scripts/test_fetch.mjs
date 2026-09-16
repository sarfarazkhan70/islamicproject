const testUrl = 'https://ia601406.us.archive.org/BookReader/BookReaderImages.php?zip=/25/items/JamiaTirmiziVolume01Part01/Jamia_Tirmizi_Volume_02_-_Part_03_jp2.zip&file=Jamia_Tirmizi_Volume_02_-_Part_03_jp2/Jamia_Tirmizi_Volume_02_-_Part_03_0000.jp2&id=JamiaTirmiziVolume01Part01&scale=2&rotate=0';

console.log('Testing URL:', testUrl);
const res = await fetch(testUrl);
console.log('Status:', res.status, 'Type:', res.headers.get('content-type'), 'Length:', res.headers.get('content-length'));
if (res.status === 200) {
  const buf = await res.arrayBuffer();
  console.log('Successfully fetched', buf.byteLength, 'bytes image!');
}
