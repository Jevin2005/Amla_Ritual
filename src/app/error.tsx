"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="status-page">
      <span className="status-page__number">○</span>
      <p className="eyebrow">A small pause</p>
      <h1>This ritual needs another try.</h1>
      <p>Nothing has been lost. Refresh this moment and continue.</p>
      <button className="button button--dark" type="button" onClick={reset}>Try again</button>
    </main>
  );
}

