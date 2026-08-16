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
      <span className="relative mb-[3px] h-[10px] w-5" aria-hidden="true">
        <i className="absolute top-0.5 left-0.5 h-1.5 w-[9px] rounded-[100%_0_100%_0] border border-current [transform:rotate(30deg)]" />
        <i className="absolute top-0.5 right-0.5 h-1.5 w-[9px] rounded-[100%_0_100%_0] border border-current [transform:scaleX(-1)_rotate(30deg)]" />
      </span>
      <span
        className={`font-serif font-medium tracking-[-0.04em] ${
          isFooter
            ? "text-[2.6rem]"
            : "text-[clamp(1.5rem,2vw,2rem)] max-[680px]:text-[1.45rem]"
        }`}
      >
        NatureMist
      </span>
      <span
        className={`mt-[5px] text-[0.43rem] font-bold tracking-[0.3em] uppercase max-[680px]:text-[0.36rem] ${
          isFooter ? "ml-0.5" : ""
        }`}
      >
        Botanical rituals
      </span>
    </span>
  );
}
