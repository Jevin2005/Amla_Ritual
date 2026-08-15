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
  return (
    <div className={`overlay-shell ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button
        className="overlay-backdrop"
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="panel-header">
          <BrandMark />
          <button type="button" className="close-button" onClick={onClose}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="mobile-menu__links">
          <Link href="/shop" onClick={onClose}>
            Shop the botanicals <span>01</span>
          </Link>
          <Link href="/rituals" onClick={onClose}>
            Choose your ritual <span>02</span>
          </Link>
          <Link href="/our-story" onClick={onClose}>
            Our story <span>03</span>
          </Link>
          <Link href="/wishlist" onClick={onClose}>
            Saved rituals <span>{wishlistCount.toString().padStart(2, "0")}</span>
          </Link>
        </div>
        <button
          type="button"
          className="button button--outline button--full"
          onClick={() => {
            onClose();
            onSearch();
          }}
        >
          Search botanicals
        </button>
        <p className="mobile-menu__note">One ingredient. Clearly explained.</p>
      </aside>
    </div>
  );
}
