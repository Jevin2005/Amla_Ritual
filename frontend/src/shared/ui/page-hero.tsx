import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  className?: string;
  children?: ReactNode;
};

function BotanicalMedallion() {
  return (
    <div
      className="relative h-[310px] w-[310px] justify-self-end max-[1040px]:hidden"
      aria-hidden="true"
    >
      <span className="absolute inset-[4%] rounded-full border border-[rgba(82,119,68,0.28)] [animation:hero-orbit-drift_16s_ease-in-out_infinite_alternate] motion-reduce:animate-none" />
      <span className="absolute inset-[-3%_8%_8%_-3%] [animation:hero-orbit-drift_20s_ease-in-out_-5s_infinite_alternate] motion-reduce:animate-none">
        <span className="block size-full rotate-[-12deg] rounded-[48%_52%_46%_54%/54%_42%_58%_46%] border border-[rgba(183,212,90,0.33)]" />
      </span>
      <span className="absolute inset-[14%] grid place-items-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,252,245,0.88),rgba(240,234,223,0.68))] text-center shadow-[0_30px_70px_rgba(21,59,45,0.13)] backdrop-blur-md">
        <span className="grid gap-1.5">
          <span className="text-[0.56rem] font-bold tracking-[0.24em] text-[var(--botanical)] uppercase">
            NatureMist
          </span>
          <span className="mx-auto h-px w-8 bg-[var(--amla)]" />
          <span className="font-serif text-[2rem] leading-none text-[var(--forest)] italic max-[960px]:text-[1.65rem]">
            Botanical
          </span>
          <span className="font-serif text-[1.05rem] text-[var(--forest)]/68">
            ritual notes
          </span>
          <span className="mt-2 text-[0.48rem] font-bold tracking-[0.16em] text-[var(--muted)] uppercase">
            Pure · considered · clear
          </span>
        </span>
      </span>
      <i className="absolute top-[6%] right-[4%] block [animation:mobile-float-a_9s_ease-in-out_infinite] motion-reduce:animate-none">
        <span className="block h-[22px] w-[48px] rotate-[28deg] rounded-[100%_0_100%_0] bg-[linear-gradient(135deg,#a9c367,#527744)] shadow-[0_10px_22px_rgba(21,59,45,0.13)]" />
      </i>
      <i className="absolute bottom-[13%] left-[-2%] block [animation:mobile-float-b_11s_ease-in-out_-3s_infinite] motion-reduce:animate-none">
        <span className="block h-[18px] w-[40px] rotate-[-42deg] rounded-[100%_0_100%_0] bg-[linear-gradient(135deg,#8ea958,#355f3a)] shadow-[0_10px_22px_rgba(21,59,45,0.12)]" />
      </i>
      <i className="absolute right-[2%] bottom-[20%] block [animation:mobile-float-c_10s_ease-in-out_-6s_infinite] motion-reduce:animate-none">
        <span className="block h-[13px] w-[29px] rotate-[128deg] rounded-[100%_0_100%_0] bg-[var(--amla)]/75" />
      </i>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  className = "",
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative isolate grid min-h-[470px] items-center overflow-hidden border-b border-[var(--line)] bg-[radial-gradient(circle_at_76%_13%,rgba(255,255,255,0.88),transparent_23%),radial-gradient(circle_at_91%_42%,rgba(183,212,90,0.2),transparent_27%),linear-gradient(132deg,#f6f1e7,var(--surface-warm)_55%,var(--ivory-deep))] py-[clamp(78px,7vw,112px)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-[linear-gradient(180deg,transparent,rgba(255,252,245,0.34))] after:content-[''] max-[680px]:min-h-[390px] max-[680px]:py-[64px] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 -z-[1] bg-[radial-gradient(rgba(21,59,45,0.18)_0.55px,transparent_0.55px)] bg-size-[8px_8px] opacity-20 [mask-image:linear-gradient(110deg,transparent_30%,black_72%,transparent_98%)]"
        aria-hidden="true"
      />
      <div className="relative z-[2] mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(240px,0.42fr)] items-center gap-[clamp(48px,7vw,110px)] px-[var(--page-pad)] max-[1040px]:grid-cols-1">
        <div className="atelier-hero-copy max-w-[820px]">
          <p className="atelier-eyebrow mb-5 mt-0">
            {eyebrow}
          </p>
          <h1 className="m-0 max-w-[14ch] font-serif text-[clamp(2.8rem,7vw,6.1rem)] font-normal leading-[0.94] tracking-[-0.048em] text-[var(--forest)] text-balance">
            {title}
          </h1>
          <p className="mb-0 mt-7 max-w-[640px] text-[1.02rem] leading-[1.75] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:text-[0.94rem] max-[680px]:leading-[1.65]">
            {description}
          </p>
          {children}
          <div className="mt-8 flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.16em] text-[var(--botanical)] uppercase max-[680px]:mt-6" aria-hidden="true">
            <span className="h-px w-10 bg-[var(--botanical)]/45" />
            Pure botanicals · considered rituals
          </div>
        </div>
        <BotanicalMedallion />
      </div>
    </section>
  );
}
