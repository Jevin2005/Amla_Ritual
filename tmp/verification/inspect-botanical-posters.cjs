const sharp = require('sharp');
const path = require('node:path');
(async () => {
  const products = ['amla', 'reetha', 'shikakai', 'hibiscus', 'bhringraj', 'indigo'];
  const kinds = ['01-ingredient', '02-preparation', '03-jar'];
  const tiles = [];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
    const file = path.join('NatureMist_18_Posters', 'WebP-website', products[row], `${products[row]}-${kinds[col]}.webp`);
    const input = await sharp(file).resize(230, 220, { fit: 'contain', background: '#f8f4e9' }).png().toBuffer();
    tiles.push({ input, left: col * 230, top: row * 225 });
  }
  await sharp({ create: { width: 690, height: 1350, channels: 3, background: '#f8f4e9' } }).composite(tiles).jpeg({ quality: 85 }).toFile('tmp/verification/botanical-posters-contact-sheet.jpg');
})();
