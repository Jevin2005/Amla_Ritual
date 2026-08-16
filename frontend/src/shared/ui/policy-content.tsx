import type { ReactNode } from "react";

export function PolicyContent({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[1080px] px-[25px] pb-[130px] pt-[90px] text-[var(--muted)] [&>h2]:mb-[15px] [&>h2]:mt-[55px] [&>h2]:font-serif [&>h2]:text-[2.5rem] [&>h2]:font-normal [&>h2]:tracking-[-0.04em] [&>h2]:text-[var(--forest)]">
      {children}
    </article>
  );
}

export function NoticeBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="my-7 border-l-[3px] border-[var(--amla)] bg-[var(--paper)] p-6">
      <strong className="text-[var(--charcoal)]">{title}</strong>
      <p>{children}</p>
    </div>
  );
}
