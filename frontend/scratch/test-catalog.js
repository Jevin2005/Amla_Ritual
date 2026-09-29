async function test() {
  const shopRes = await fetch('http://localhost:3000/shop');
  const shopHtml = await shopRes.text();
  const regex = /href="\/shop\/([^"#]+)"/g;
  const links = new Set();
  let match;
  while ((match = regex.exec(shopHtml)) !== null) {
    links.add(match[1]);
  }
  console.log('Unique /shop/ links on /shop page:');
  console.log([...links]);

  // Now let's fetch /reviews page
  const revRes = await fetch('http://localhost:3000/reviews');
  const revHtml = await revRes.text();
  const revLinks = new Set();
  while ((match = regex.exec(revHtml)) !== null) {
    revLinks.add(match[1]);
  }
  console.log('\nUnique /shop/ links on /reviews page:');
  console.log([...revLinks]);
}

test();
