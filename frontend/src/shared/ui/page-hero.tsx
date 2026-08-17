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
      className={`grid min-h-[430px] items-end bg-[radial-gradient(circle_at_82%_30%,rgba(167,201,67,0.18),transparent_28%),var(--ivory-deep)] pb-[70px] pt-[95px] max-[680px]:min-h-[350px] max-[680px]:pb-[52px] max-[680px]:pt-[72px] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] max-[680px]:px-5">
        <div className="max-w-[820px]">
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
            {eyebrow}
          </p>
          <h1 className="m-0 max-w-[14ch] font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.9rem,14vw,4.5rem)]">
            {title}
          </h1>
          <p className="mb-0 mt-7 max-w-[620px] text-base leading-[1.7] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:text-[0.94rem]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
