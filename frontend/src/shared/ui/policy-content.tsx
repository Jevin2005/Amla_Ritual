import type { ReactNode } from "react";

export function PolicyContent({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[960px] px-[clamp(24px,5vw,64px)] pb-[130px] pt-[90px] text-[var(--muted)] [&>h2]:mb-[15px] [&>h2]:mt-[55px] [&>h2]:max-w-[22ch] [&>h2]:font-serif [&>h2]:text-[clamp(2rem,4vw,2.7rem)] [&>h2]:font-normal [&>h2]:leading-[1.05] [&>h2]:tracking-[-0.04em] [&>h2]:text-[var(--forest)] [&>p]:max-w-[760px] [&>p]:leading-[1.8] max-[680px]:px-5 max-[680px]:pb-[90px] max-[680px]:pt-[65px]">
      {children}
    </article>
  );
}

export function NoticeBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-7 border-l-[3px] border-[var(--amla)] bg-[var(--paper)] p-6 max-[680px]:p-5">
      <strong className="block font-serif text-[1.2rem] font-normal text-[var(--charcoal)]">{title}</strong>
      <p className="mb-0 mt-2 leading-[1.7]">{children}</p>
    </div>
  );
}
