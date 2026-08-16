export default function Loading() {
  return (
    <main id="main-content" className="flex min-h-[72vh] flex-col items-center justify-center px-[clamp(24px,5vw,72px)] py-20 text-center max-[680px]:px-5" aria-label="Loading NatureMist">
      <span className="relative mb-[25px] h-[60px] w-[85px] before:absolute before:left-1/2 before:top-2 before:h-[50px] before:w-px before:bg-[var(--botanical)] before:content-['']" aria-hidden="true">
        <i className="absolute left-[10px] top-[13px] h-5 w-9 rounded-[100%_0_100%_0] border border-[var(--botanical)] [animation:loading-leaf_1.5s_ease-in-out_infinite_alternate] motion-reduce:animate-none" />
        <i className="absolute right-2 top-[34px] h-5 w-9 scale-x-[-1] rounded-[100%_0_100%_0] border border-[var(--botanical)] [animation:loading-leaf_1.5s_ease-in-out_infinite_alternate] [animation-delay:-0.7s] motion-reduce:animate-none" />
      </span>
      <p className="text-[0.68rem] uppercase tracking-[0.15em] text-[var(--forest)]">Preparing your ritual…</p>
    </main>
  );
}
