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
      className={`grid min-h-[430px] items-end bg-[radial-gradient(circle_at_82%_30%,rgba(167,201,67,0.18),transparent_28%),var(--ivory-deep)] px-[clamp(25px,7vw,110px)] pb-[70px] pt-[95px] max-[680px]:min-h-[360px] max-[680px]:px-5 max-[680px]:pb-[55px] max-[680px]:pt-[75px] ${className}`}
    >
      <div className="max-w-[820px]">
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
          {eyebrow}
        </p>
        <h1 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.5rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] max-[680px]:text-[clamp(3rem,15vw,4.8rem)]">
          {title}
        </h1>
        <p className="mb-0 mt-7 max-w-[620px] text-base text-[var(--muted)]">
          {description}
        </p>
      </div>
    </section>
  );
}
