import type { ReactNode } from "react";

export function PolicyContent({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[1040px] px-[var(--page-pad)] pb-[130px] pt-[90px] text-[var(--muted)] [&>h2]:mb-[16px] [&>h2]:mt-[58px] [&>h2]:max-w-[22ch] [&>h2]:border-t [&>h2]:border-[var(--line)] [&>h2]:pt-[38px] [&>h2]:font-serif [&>h2]:text-[clamp(2rem,4vw,2.8rem)] [&>h2]:font-normal [&>h2]:leading-[1.02] [&>h2]:tracking-[-0.035em] [&>h2]:text-[var(--forest)] [&>p]:max-w-[780px] [&>p]:text-[1rem] [&>p]:leading-[1.82] max-[680px]:pb-[90px] max-[680px]:pt-[64px] max-[680px]:[&>h2]:mt-[44px] max-[680px]:[&>h2]:pt-[28px] max-[680px]:[&>p]:text-[0.94rem]">
      {children}
    </article>
  );
}

export function NoticeBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative my-8 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] px-7 py-6 shadow-[var(--shadow-soft)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:bg-[var(--amla)] before:content-[''] max-[680px]:px-5 max-[680px]:py-5">
      <strong className="block max-w-[30ch] font-serif text-[1.35rem] font-normal leading-[1.2] text-[var(--forest)]">
        {title}
      </strong>
      <p className="mb-0 mt-2.5 max-w-[760px] text-[0.94rem] leading-[1.72] text-[var(--muted)]">
        {children}
      </p>
    </div>
  );
}
