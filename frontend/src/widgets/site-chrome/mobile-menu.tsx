import Link from "next/link";
import type { RefObject } from "react";
import { BrandMark } from "./brand-mark";

type MobileMenuProps = {
  open: boolean;
  wishlistCount: number;
  menuRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSearch: () => void;
};

export function MobileMenu({
  open,
  wishlistCount,
  menuRef,
  onClose,
  onSearch,
}: MobileMenuProps) {
  const mobileLinkClass =
    "flex min-h-[70px] items-center justify-between border-b border-[var(--line)] font-serif text-[1.7rem] text-[var(--forest)]";

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
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
      />
      <aside
        className={`absolute inset-y-0 right-0 hidden w-[min(500px,100%)] overflow-y-auto bg-[var(--paper)] pb-[35px] shadow-[-30px_0_70px_rgba(0,0,0,0.15)] transition-[transform] duration-[520ms] ease-[var(--ease)] max-[900px]:block ${
          open ? "[transform:translateX(0)]" : "[transform:translateX(102%)]"
        }`}
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex min-h-[105px] items-center justify-between border-b border-[var(--line)] px-[30px] py-[22px] max-[680px]:min-h-[88px] max-[680px]:px-5 max-[680px]:py-[17px]">
          <BrandMark />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-transparent text-[1.5rem] text-[var(--forest)] transition-[transform,background] duration-[280ms] ease-[ease] hover:bg-[var(--ivory)] hover:[transform:rotate(90deg)]"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="grid px-[30px] pt-[25px] pb-10">
          <Link className={mobileLinkClass} href="/shop" onClick={onClose}>
            Shop the botanicals{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">01</span>
          </Link>
          <Link className={mobileLinkClass} href="/rituals" onClick={onClose}>
            Choose your ritual{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">02</span>
          </Link>
          <Link className={mobileLinkClass} href="/our-story" onClick={onClose}>
            Our story{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">03</span>
          </Link>
          <Link className={mobileLinkClass} href="/wishlist" onClick={onClose}>
            Saved rituals{" "}
            <span className="font-sans text-[0.57rem] text-[var(--botanical)]">
              {wishlistCount.toString().padStart(2, "0")}
            </span>
          </Link>
        </div>
        <button
          type="button"
          className="mx-[30px] inline-flex min-h-[50px] w-[calc(100%_-_60px)] items-center justify-center gap-[22px] border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--forest)] uppercase transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
          onClick={() => {
            onClose();
            onSearch();
          }}
        >
          Search botanicals
        </button>
        <p className="mx-[30px] mt-[26px] text-center text-[0.65rem] tracking-[0.12em] text-[var(--muted)] uppercase">
          One ingredient. Clearly explained.
        </p>
      </aside>
    </div>
  );
}
