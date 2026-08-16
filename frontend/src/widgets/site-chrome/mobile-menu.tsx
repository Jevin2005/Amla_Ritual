import Link from "next/link";
import type { RefObject } from "react";
import { BrandMark } from "./brand-mark";

type MobileMenuProps = {
  open: boolean;
  wishlistCount: number;
  currentPath: string;
  menuRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSearch: () => void;
};

export function MobileMenu({
  open,
  wishlistCount,
  currentPath,
  menuRef,
  onClose,
  onSearch,
}: MobileMenuProps) {
  const mobileLinkClass =
    "flex min-h-[68px] items-center justify-between gap-5 border-b border-[var(--line)] font-serif text-[clamp(1.45rem,7vw,1.75rem)] text-[var(--forest)] transition-[padding,color] duration-300 ease-[var(--ease)] hover:pl-1 hover:text-[var(--botanical)] aria-[current=page]:text-[var(--botanical)]";
  const utilityLinkClass =
    "inline-flex min-h-11 items-center border-b border-[var(--line)] text-[0.66rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase transition-colors hover:text-[var(--botanical)] aria-[current=page]:text-[var(--botanical)]";

  const handleSearch = () => {
    onClose();
    window.setTimeout(onSearch, 0);
  };

  return (
    <div
      className={`fixed inset-0 z-[500] ${
        open ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        className={`absolute inset-0 bg-[rgba(11,29,18,0.56)] backdrop-blur-[4px] transition-opacity duration-[380ms] ease-[ease] ${
          open ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={onClose}
        aria-hidden="true"
        tabIndex={-1}
      />
      <aside
        className={`absolute inset-y-0 right-0 hidden w-[min(440px,100%)] overflow-y-auto overscroll-contain bg-[var(--paper)] pb-[calc(28px+env(safe-area-inset-bottom))] shadow-[-30px_0_70px_rgba(0,0,0,0.15)] transition-[transform] duration-[520ms] ease-[var(--ease)] max-[680px]:block ${
          open ? "[transform:translateX(0)]" : "[transform:translateX(102%)]"
        }`}
        ref={menuRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex min-h-[88px] items-center justify-between border-b border-[var(--line)] pr-[max(20px,env(safe-area-inset-right))] pb-[17px] pl-[max(20px,env(safe-area-inset-left))] pt-[calc(17px+env(safe-area-inset-top))]">
          <Link href="/" aria-label="NatureMist home" onClick={onClose}>
            <BrandMark />
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-transparent text-[1.5rem] text-[var(--forest)] transition-[transform,background] duration-[280ms] ease-[ease] hover:bg-[var(--ivory)] hover:[transform:rotate(90deg)]"
            onClick={onClose}
            data-autofocus
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav
          className="grid pr-[max(20px,env(safe-area-inset-right))] pb-8 pl-[max(20px,env(safe-area-inset-left))] pt-4"
          aria-label="Mobile primary navigation"
        >
          <Link
            className={mobileLinkClass}
            href="/shop"
            onClick={onClose}
            aria-current={currentPath.startsWith("/shop") ? "page" : undefined}
          >
            Shop the botanicals{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">01</span>
          </Link>
          <Link
            className={mobileLinkClass}
            href="/rituals"
            onClick={onClose}
            aria-current={currentPath === "/rituals" ? "page" : undefined}
          >
            Choose your ritual{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">02</span>
          </Link>
          <Link
            className={mobileLinkClass}
            href="/our-story"
            onClick={onClose}
            aria-current={currentPath === "/our-story" ? "page" : undefined}
          >
            Our story{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">03</span>
          </Link>
          <Link
            className={mobileLinkClass}
            href="/wishlist"
            onClick={onClose}
            aria-current={currentPath === "/wishlist" ? "page" : undefined}
          >
            Saved rituals{" "}
            <span
              className="font-sans text-[0.57rem] text-[var(--botanical)]"
              aria-label={`${wishlistCount} saved ${wishlistCount === 1 ? "item" : "items"}`}
            >
              {wishlistCount.toString().padStart(2, "0")}
            </span>
          </Link>
        </nav>
        <div className="pr-[max(20px,env(safe-area-inset-right))] pl-[max(20px,env(safe-area-inset-left))]">
          <button
            type="button"
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-[22px] border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--forest)] uppercase transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
            onClick={handleSearch}
          >
            Search botanicals <span aria-hidden="true">↗</span>
          </button>
        </div>
        <nav
          className="mt-6 grid grid-cols-2 gap-x-5 pr-[max(20px,env(safe-area-inset-right))] pl-[max(20px,env(safe-area-inset-left))]"
          aria-label="Customer care"
        >
          <Link
            className={utilityLinkClass}
            href="/track-order"
            onClick={onClose}
            aria-current={currentPath === "/track-order" ? "page" : undefined}
          >
            Track order
          </Link>
          <Link
            className={utilityLinkClass}
            href="/shipping-returns"
            onClick={onClose}
            aria-current={
              currentPath === "/shipping-returns" ? "page" : undefined
            }
          >
            Shipping + returns
          </Link>
          <Link
            className={utilityLinkClass}
            href="/privacy"
            onClick={onClose}
            aria-current={currentPath === "/privacy" ? "page" : undefined}
          >
            Privacy
          </Link>
          <Link
            className={utilityLinkClass}
            href="/terms"
            onClick={onClose}
            aria-current={currentPath === "/terms" ? "page" : undefined}
          >
            Terms
          </Link>
        </nav>
        <p className="mt-[26px] pr-[max(20px,env(safe-area-inset-right))] pl-[max(20px,env(safe-area-inset-left))] text-center text-[0.65rem] tracking-[0.12em] text-[var(--muted)] uppercase">
          One ingredient. Clearly explained.
        </p>
      </aside>
    </div>
  );
}
