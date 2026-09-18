const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

const coversDir = path.resolve('public/fatawa/covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// 31 canonical volume metadata
const volumes = [
  { key: '1.1', jildUrdu: 'جلد ۱.۱', topicUrdu: 'کتاب الطہارۃ (میاہ، حوض، وضوء)' },
  { key: '1.2', jildUrdu: 'جلد ۱.۲', topicUrdu: 'کتاب الطہارۃ (احکام وضوء و مسح)' },
  { key: '2', jildUrdu: 'جلد ۲', topicUrdu: 'کتاب الطہارۃ (غسل، تیمم، نجاسات)' },
  { key: '3', jildUrdu: 'جلد ۳', topicUrdu: 'کتاب الطہارۃ (ازالۃ النجاسۃ، استنجاء)' },
  { key: '4', jildUrdu: 'جلد ۴', topicUrdu: 'کتاب الصلاۃ (اوقات نماز، فلکیاتی تحقیق)' },
  { key: '5', jildUrdu: 'جلد ۵', topicUrdu: 'کتاب الصلاۃ (شروط صلاۃ، سمت قبلہ)' },
  { key: '6', jildUrdu: 'جلد ۶', topicUrdu: 'کتاب الصلاۃ (ارکان صلاۃ، اذان، امامت)' },
  { key: '7', jildUrdu: 'جلد ۷', topicUrdu: 'کتاب الصلاۃ (جماعت، جمعہ، عیدین)' },
  { key: '8', jildUrdu: 'جلد ۸', topicUrdu: 'کتاب الصلاۃ (مسافر، قضاء نمازیں، سہو)' },
  { key: '9', jildUrdu: 'جلد ۹', topicUrdu: 'کتاب الجنائز (زیارت قبور، ایصال ثواب)' },
  { key: '10', jildUrdu: 'جلد ۱۰', topicUrdu: 'کتاب الزکاۃ (مصارف زکاۃ، صدقہ فطر)' },
  { key: '11', jildUrdu: 'جلد ۱۱', topicUrdu: 'کتاب الصوم (رویت ہلال، اعتکاف)' },
  { key: '12', jildUrdu: 'جلد ۱۲', topicUrdu: 'کتاب الحج (مناسک حج، زیارت مدینہ)' },
  { key: '13', jildUrdu: 'جلد ۱۳', topicUrdu: 'کتاب النکاح (ولایت، کفاءت، مہر)' },
  { key: '14', jildUrdu: 'جلد ۱۴', topicUrdu: 'کتاب النکاح (محرمات، حقوق زوجین)' },
  { key: '15', jildUrdu: 'جلد ۱۵', topicUrdu: 'کتاب الطلاق (ایقاع طلاق، کنایات)' },
  { key: '16', jildUrdu: 'جلد ۱۶', topicUrdu: 'کتاب الطلاق (عدت، نفقہ، خلع)' },
  { key: '17', jildUrdu: 'جلد ۱۷', topicUrdu: 'کتاب العتاق والایمان والنذور' },
  { key: '18', jildUrdu: 'جلد ۱۸', topicUrdu: 'کتاب الحدود والسرقۃ والجہاد' },
  { key: '19', jildUrdu: 'جلد ۱۹', topicUrdu: 'کتاب الجزیۃ واللقطۃ والاموال' },
  { key: '20', jildUrdu: 'جلد ۲۰', topicUrdu: 'کتاب الغصب والودیعۃ والعاریۃ' },
  { key: '21', jildUrdu: 'جلد ۲۱', topicUrdu: 'کتاب البیوع (شرائط بیع، خیارات)' },
  { key: '22', jildUrdu: 'جلد ۲۲', topicUrdu: 'کتاب البیوع (بیع فاسد، ربا و سود)' },
  { key: '23', jildUrdu: 'جلد ۲۳', topicUrdu: 'کتاب الاجارۃ والکفالۃ والوکالۃ' },
  { key: '24', jildUrdu: 'جلد ۲۴', topicUrdu: 'کتاب الشفعۃ والقسمۃ والمزارعۃ' },
  { key: '25', jildUrdu: 'جلد ۲۵', topicUrdu: 'کتاب الذبائح والصید والاضحیۃ' },
  { key: '26', jildUrdu: 'جلد ۲۶', topicUrdu: 'کتاب الکراہیۃ والاستحسان والادب' },
  { key: '27', jildUrdu: 'جلد ۲۷', topicUrdu: 'کتاب الفرائض والوصایا والموات' },
  { key: '28', jildUrdu: 'جلد ۲۸', topicUrdu: 'رسائل و عقائد (رد بدعات و منکرات)' },
  { key: '29', jildUrdu: 'جلد ۲۹', topicUrdu: 'رسائل علمیہ و فقہیہ و تصوف' },
  { key: '30', jildUrdu: 'جلد ۳۰', topicUrdu: 'فہارس جامعہ و رسائل متفرقہ' },
];

const width = 600;
const height = 825; // standard 120 : 165 aspect ratio (1 : 1.375)

for (const vol of volumes) {
  const normKey = vol.key.replace('.', '_');
  const targetFile = path.join(coversDir, `cover_${normKey}.webp`);

  // If Jild 1.1, copy from authentic rendered page 1
  if (vol.key === '1.1') {
    const p1 = path.resolve('public/fatawa/vol_1_1/pages/page_1.webp');
    if (fs.existsSync(p1)) {
      fs.copyFileSync(p1, targetFile);
      console.log('Saved cover_1_1.webp from authentic scan');
      continue;
    }
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Deep Emerald to Navy Islamic Leather Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#064e3b');
  bgGrad.addColorStop(0.5, '#022c22');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Intricate Gold Outer Border
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, width - 68, height - 68);

  // Corner Ornaments
  const cornerSize = 40;
  const corners = [
    [34, 34],
    [width - 34, 34],
    [34, height - 34],
    [width - 34, height - 34]
  ];
  ctx.fillStyle = '#f59e0b';
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top Arabic Title: العطایا النبویة فی الفتاوی الرضویة
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillText('الْعَطَايَا النَّبَوِيَّة فِي الْفَتَاوَى الرَّضَوِيَّة', width / 2, 85);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 115);
  ctx.lineTo(width - 100, 115);
  ctx.stroke();

  // Grand Title Box
  const boxGrad = ctx.createLinearGradient(60, 140, width - 60, 310);
  boxGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
  boxGrad.addColorStop(0.5, 'rgba(6, 78, 59, 0.9)');
  boxGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
  ctx.fillStyle = boxGrad;
  ctx.fillRect(60, 140, width - 120, 170);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 140, width - 120, 170);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Traditional Arabic", "Jameel Noori Nastaleeq", "Noto Naskh Arabic", Arial, sans-serif';
  ctx.fillText('فتاویٰ رضویہ', width / 2, 210);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('مُخَرَّجَہ وَ مُتَرْجَمَہ', width / 2, 275);

  // Center Volume Medallion
  const medY = 400;
  ctx.beginPath();
  ctx.arc(width / 2, medY, 65, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText(vol.jildUrdu, width / 2, medY);

  // Topic Title Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 21px Arial, sans-serif';
  ctx.fillText(vol.topicUrdu, width / 2, 530);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 565);
  ctx.lineTo(width - 120, 565);
  ctx.stroke();

  // Author Box & Attribution
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('مُصَنِّف: اِمَامِ اَہْلِ سُنَّتْ مُجَدِّدِ دِینْ وَ مِلَّتْ', width / 2, 610);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Traditional Arabic", Arial, sans-serif';
  ctx.fillText('اَلشَّاہْ اِمَامْ اَحْمَدْ رَضَا خَانْ بَرِیلْوِی', width / 2, 655);

  ctx.fillStyle = '#93c5fd';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('قَدَّسَ سِرُّهُ الْعَزِيز (۱۲۷۲ - ۱۳۴۰ ھ)', width / 2, 695);

  // Bottom Publication Standard
  ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('الْمَجْمُوعَةُ الْفِقْهِيَّةُ الْكَامِلَة — ۳۱ مُجَلَّداً', width / 2, 765);

  const buf = canvas.toBuffer('image/webp', 90);
  fs.writeFileSync(targetFile, buf);
  console.log(`Generated cover for Jild ${vol.key} -> cover_${normKey}.webp`);
}

console.log('ALL 31 VOLUME COVERS CREATED SUCCESSFULLY!');
