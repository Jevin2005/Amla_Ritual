import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="status-page">
      <span className="status-page__number">404</span>
      <p className="eyebrow">This path has gone quiet</p>
      <h1>The ritual isn’t here.</h1>
      <p>Return to the botanical cabinet and begin again.</p>
      <Link className="button button--dark" href="/shop">Explore the collection</Link>
    </main>
  );
}

