async function checkReviews() {
  const res = await fetch('http://localhost:3000/reviews');
  const html = await res.text();
  console.log('Reviews page status:', res.status);
  
  // Extract review cards
  const authorMatches = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => m[1]);
  console.log('Authors on /reviews:', authorMatches);

  const productMatches = [...html.matchAll(/href="\/shop\/([^"#]+)#customer-reviews"/g)].map(m => m[1]);
  console.log('Product links on review cards:', productMatches);
}
checkReviews();
