import type { ReactNode } from "react";

export function PolicyContent({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[1040px] px-[var(--page-pad)] pb-[130px] pt-[90px] text-[var(--muted)] [&_a]:text-[var(--forest)] [&_a]:underline [&_h2]:mb-[16px] [&_h2]:mt-[58px] [&_h2]:max-w-[22ch] [&_h2]:border-t [&_h2]:border-[var(--line)] [&_h2]:pt-[38px] [&_h2]:font-serif [&_h2]:text-[clamp(2rem,4vw,2.8rem)] [&_h2]:font-normal [&_h2]:leading-[1.02] [&_h2]:tracking-[-0.035em] [&_h2]:text-[var(--forest)] [&_li]:max-w-[780px] [&_li]:leading-[1.82] [&_p]:max-w-[780px] [&_p]:text-[1rem] [&_p]:leading-[1.82] max-[680px]:pb-[90px] max-[680px]:pt-[64px] max-[680px]:[&_h2]:mt-[44px] max-[680px]:[&_h2]:pt-[28px] max-[680px]:[&_p]:text-[0.94rem]">
      {children}
    </article>
  );
}

export function ShopifyPolicyContent({ html }: { html: string }) {
  return (
    <PolicyContent>
      <ShopifyPolicyBody html={html} />
    </PolicyContent>
  );
}

const allowedPolicyTags = new Set([
  "a",
  "blockquote",
  "br",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safePolicyLink(value: string) {
  const link = value.trim();
  if (/^(?:https?:|mailto:|tel:)/i.test(link) || link.startsWith("/") || link.startsWith("#")) {
    return link;
  }
  return null;
}

function sanitizeShopifyPolicyHtml(html: string) {
  const withoutExecutableContent = html
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");

  return (withoutExecutableContent.match(/<[^>]*>|[^<]+/g) || [])
    .map((token) => {
      if (!token.startsWith("<")) return token;

      const closing = token.match(/^<\s*\/\s*([a-z0-9]+)[^>]*>$/i);
      if (closing) {
        const tag = closing[1].toLowerCase();
        return allowedPolicyTags.has(tag) && tag !== "br" ? `</${tag}>` : "";
      }

      const opening = token.match(/^<\s*([a-z0-9]+)\b([^>]*)>$/i);
      if (!opening) return "";
      const tag = opening[1].toLowerCase();
      if (!allowedPolicyTags.has(tag)) return "";
      if (tag === "br") return "<br>";
      if (tag !== "a") return `<${tag}>`;

      const hrefMatch = opening[2].match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const href = safePolicyLink(hrefMatch?.[1] || hrefMatch?.[2] || "");
      return href
        ? `<a href="${escapeAttribute(href)}" rel="nofollow noopener noreferrer">`
        : "<a>";
    })
    .join("");
}

export function ShopifyPolicyBody({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeShopifyPolicyHtml(html) }} />;
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
