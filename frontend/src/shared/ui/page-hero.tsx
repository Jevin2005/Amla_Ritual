import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  className?: string;
};

export function PageHero({ eyebrow, title, description, className = "" }: PageHeroProps) {
  return (
    <section
      className={`relative isolate grid min-h-[430px] items-end overflow-hidden border-b border-[var(--line)] bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_88%_38%,rgba(183,212,90,0.2),transparent_30%),linear-gradient(135deg,var(--surface-warm),var(--ivory-deep))] pb-[70px] pt-[95px] max-[680px]:min-h-[350px] max-[680px]:pb-[52px] max-[680px]:pt-[72px] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 -z-[1] bg-[radial-gradient(rgba(21,59,45,0.18)_0.55px,transparent_0.55px)] bg-size-[8px_8px] opacity-20 [mask-image:linear-gradient(110deg,transparent_30%,black_72%,transparent_98%)]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-[8%] top-[13%] -z-[1] h-[315px] w-[235px] rounded-t-[999px] border border-[rgba(82,119,68,0.24)] before:absolute before:inset-[22px] before:rounded-t-[999px] before:border before:border-[rgba(82,119,68,0.13)] before:content-[''] after:absolute after:-left-[10px] after:top-[42%] after:size-[9px] after:rounded-full after:bg-[var(--amla)] after:shadow-[0_0_0_9px_rgba(183,212,90,0.12)] after:content-[''] max-[900px]:right-[4%] max-[680px]:right-[-70px] max-[680px]:top-[8%] max-[680px]:h-[250px] max-[680px]:w-[180px]"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)]">
        <div className="atelier-hero-copy max-w-[820px]">
          <p className="atelier-eyebrow mb-5 mt-0">
            {eyebrow}
          </p>
          <h1 className="m-0 max-w-[14ch] font-serif text-[clamp(3.1rem,5.2vw,6.1rem)] font-normal leading-[0.94] tracking-[-0.048em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.7rem,13vw,4.2rem)]">
            {title}
          </h1>
          <p className="mb-0 mt-7 max-w-[640px] text-[1.02rem] leading-[1.75] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:text-[0.94rem] max-[680px]:leading-[1.65]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
