const signatures = [
  {
    number: "01",
    title: "Pure by nature",
    description: "One botanical, clearly named.",
  },
  {
    number: "02",
    title: "Ritual, simplified",
    description: "Preparation you can follow.",
  },
  {
    number: "03",
    title: "Rooted in tradition",
    description: "Indian plant wisdom, calmly translated.",
  },
  {
    number: "04",
    title: "Made to return to",
    description: "A considered rhythm for wash day.",
  },
];

export function RitualSignatures() {
  return (
    <section
      className="relative z-20 mx-auto -mt-3 w-full max-w-[1520px] px-[clamp(16px,3.5vw,52px)] max-[680px]:-mt-1 max-[680px]:px-2.5"
      aria-label="The NatureMist standard"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_7%_0%,rgba(183,212,90,0.16),transparent_25%),linear-gradient(125deg,var(--forest-dark),#163f30_58%,#1d4938)] px-[clamp(22px,3vw,46px)] py-[clamp(24px,2.8vw,38px)] text-[var(--paper)] shadow-[0_30px_80px_rgba(11,40,29,0.19)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.2)_0.5px,transparent_0.5px)] before:bg-size-[8px_8px] before:opacity-[0.08] before:content-[''] max-[680px]:rounded-[18px] max-[680px]:px-4 max-[680px]:py-4"
      >
        <div className="relative mb-5 flex items-center justify-between gap-5 border-b border-white/15 pb-4 max-[680px]:mb-3 max-[680px]:pb-3">
          <p className="m-0 flex items-center gap-2.5 text-[0.65rem] font-bold tracking-[0.17em] text-[var(--amla)] uppercase max-[680px]:text-[0.64rem]">
            <span className="block h-[9px] w-[19px] -rotate-12 rounded-[100%_0_100%_0] bg-[var(--amla)] shadow-[0_0_0_5px_rgba(183,212,90,0.09)]" aria-hidden="true" />
            The NatureMist standard
          </p>
          <p className="m-0 text-right font-serif text-[0.92rem] text-white/58 italic max-[680px]:hidden">
            Four details behind every considered ritual
          </p>
        </div>

        <ol className="relative m-0 grid list-none grid-cols-4 p-0 max-[920px]:grid-cols-2">
          {signatures.map((signature, index) => (
            <li
              className={`group relative grid min-h-[92px] grid-cols-[32px_1fr] gap-3 px-[clamp(14px,2vw,28px)] py-2 transition-[background-color,transform] duration-300 ease-[var(--ease)] first:pl-0 hover:-translate-y-0.5 hover:bg-white/[0.035] motion-reduce:hover:translate-y-0 motion-reduce:transition-none max-[920px]:border-b max-[920px]:border-white/12 max-[920px]:py-4 max-[680px]:min-h-[98px] max-[680px]:grid-cols-[27px_1fr] max-[680px]:gap-2 max-[680px]:px-2.5 max-[680px]:py-3.5 ${
                index < signatures.length - 1
                  ? "border-r border-white/12 max-[920px]:even:border-r-0"
                  : "border-r-0"
              }`}
              key={signature.number}
            >
              <span className="pt-0.5 font-serif text-[0.76rem] text-[var(--amla)]/80 max-[680px]:text-[0.7rem]">
                {signature.number}
              </span>
              <div>
                <h2 className="m-0 font-serif text-[clamp(1rem,1.25vw,1.22rem)] font-normal leading-[1.1] text-[var(--paper)] max-[680px]:text-[0.96rem]">
                  {signature.title}
                </h2>
                <p className="mt-2 mb-0 text-[0.7rem] leading-[1.45] text-white/70 max-[680px]:mt-1.5 max-[680px]:text-[0.7rem] max-[680px]:leading-[1.5]">
                  {signature.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
