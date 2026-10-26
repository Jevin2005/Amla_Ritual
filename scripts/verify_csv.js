const fs = require('fs');
const path = require('path');

function verify(filename) {
  console.log(`\n================ Checking ${filename} ================`);
  const filepath = path.join(__dirname, '..', filename);
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  console.log('Total non-empty lines:', lines.length);
  console.log('Header:', lines[0]);

  let valid = 0;
  let errors = [];
  const emails = new Set();
  const names = new Set();
  const productCounts = {};
  const ratings = {};
  let hinglishCount = 0;
  let englishCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const matches = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        matches.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    matches.push(cur.trim());

    if (matches.length !== 8) {
      errors.push(`Line ${i + 1}: expected 8 fields, got ${matches.length}`);
      continue;
    }

    const [title, body, ratingStr, date, name, email, pid, handle] = matches;
    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push(`Line ${i + 1}: invalid rating '${ratingStr}'`);
    }
    ratings[rating] = (ratings[rating] || 0) + 1;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Line ${i + 1}: invalid date '${date}'`);
    }
    if (!email.includes('@')) {
      errors.push(`Line ${i + 1}: invalid email '${email}'`);
    }
    if (!title || !body) {
      errors.push(`Line ${i + 1}: empty title or body`);
    }

    // Check hinglish detection
    const isHinglish = /baal|dahi|hai|ho gaya|shuru|mummy|kangi|khushboo|sukhoon|paani|pehle|ache|nahi/i.test(body + ' ' + title);
    if (isHinglish) hinglishCount++;
    else englishCount++;

    productCounts[handle] = (productCounts[handle] || 0) + 1;
    emails.add(email);
    names.add(name);
    valid++;
  }

  console.log('Valid review rows:', valid);
  console.log('Errors:', errors.length ? errors.slice(0, 5) : 'None');
  console.log('Unique emails:', emails.size);
  console.log('Unique names:', names.size);
  console.log('Product handles:', productCounts);
  console.log('Ratings breakdown:', ratings);
  console.log(`Language detection: ~${hinglishCount} Hinglish reviews, ~${englishCount} English reviews`);
}

verify('amla_only_1000_reviews_judgeme.csv');
verify('reetha_only_1000_reviews_judgeme.csv');
verify('shikakai_only_reviews_judgeme.csv');
verify('bhringraj_only_reviews_judgeme.csv');
verify('hibiscus_only_reviews_judgeme.csv');
verify('indigo_only_reviews_judgeme.csv');
verify('classic_trio_only_reviews_judgeme.csv');
verify('bulk_reviews_judgeme.csv');


