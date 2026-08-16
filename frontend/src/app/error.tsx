"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="flex min-h-[72vh] flex-col items-center justify-center px-[clamp(24px,5vw,72px)] py-20 text-center max-[680px]:px-5">
      <span className="font-serif text-[clamp(7rem,17vw,15rem)] leading-[0.7] text-[var(--beige)]">○</span>
      <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">A small pause</p>
      <h1 className="my-[15px] max-w-[12ch] font-serif text-[clamp(3.5rem,6vw,6.5rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance">This ritual needs another try.</h1>
      <p className="max-w-[460px] leading-[1.7] text-[var(--muted)]">Nothing has been lost. Refresh this moment and continue.</p>
      <button className="mt-[15px] inline-flex min-h-[50px] items-center justify-center gap-[22px] border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)]" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
