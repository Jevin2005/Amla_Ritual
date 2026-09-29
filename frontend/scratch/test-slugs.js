async function test() {
  const slugs = ['amla', 'wildcrafted-amla-powder', 'reetha-powder', 'bhringraj-powder', 'hibiscus-powder', 'indigo-powder'];
  for (const s of slugs) {
    const res = await fetch(`http://localhost:3000/shop/${s}`);
    const html = await res.text();
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    console.log(`Slug: /shop/${s} -> Status: ${res.status} -> Title: ${titleMatch ? titleMatch[1].trim() : 'No title'}`);
  }
}
test();
