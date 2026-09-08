type BrandMarkProps = {
  variant?: "default" | "footer";
};

export function BrandMark({ variant = "default" }: BrandMarkProps) {
  const isFooter = variant === "footer";

  return (
    <span
      className={`grid leading-none ${
        isFooter
          ? "w-max justify-items-start text-[var(--paper)]"
          : "justify-items-center text-[var(--forest)]"
      }`}
      aria-label="NatureMist home"
    >
      <span
        className="relative mb-1 h-3 w-[26px] after:absolute after:bottom-0 after:left-1/2 after:h-2.5 after:w-px after:-translate-x-1/2 after:bg-current after:opacity-55 after:content-['']"
        aria-hidden="true"
      >
        <i className="absolute left-0.5 top-0 h-2 w-[11px] rounded-[100%_0_100%_0] border border-current [transform:rotate(27deg)]" />
        <i className="absolute right-0.5 top-0 h-2 w-[11px] rounded-[100%_0_100%_0] border border-current [transform:scaleX(-1)_rotate(27deg)]" />
      </span>
      <span
        className={`font-serif font-medium tracking-[-0.045em] ${
          isFooter
            ? "text-[2.8rem]"
            : "text-[clamp(1.65rem,2vw,2rem)] max-[900px]:text-[1.55rem]"
        }`}
      >
        NatureMist
      </span>
      <span
        className={`mt-1 text-[0.62rem] font-bold tracking-[0.2em] uppercase opacity-[0.82] max-[900px]:text-[0.56rem] max-[900px]:tracking-[0.16em] ${
          isFooter ? "ml-0.5 opacity-[0.72]" : ""
        }`}
      >
        Botanical rituals
      </span>
    </span>
  );
}
