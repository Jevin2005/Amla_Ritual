"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { BrandMark } from "./brand-mark";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  const { cartCount, wishlist, openCart, openSearch } = useStore();
  const wishlistCount = wishlist.length;
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useModalFocus(mobileOpen, mobileRef, closeMobile);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement-bar">
        <p>
          Rooted in Ayurveda <span aria-hidden="true">•</span> Made for modern rituals
        </p>
        <Link href="/rituals">
          Find your ritual <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <header className={`site-header ${compact ? "is-compact" : ""}`}>
        <nav className="site-nav" aria-label="Primary navigation">
          <div className="site-nav__left">
            <Link className="nav-link" href="/shop">
              Shop
            </Link>
            <Link className="nav-link" href="/rituals">
              Rituals
            </Link>
            <Link className="nav-link" href="/our-story">
              Our Story
            </Link>
          </div>
          <Link className="site-nav__logo" href="/">
            <BrandMark />
          </Link>
          <div className="site-nav__actions">
            <button className="text-action desktop-action" type="button" onClick={openSearch}>
              Search
            </button>
            <Link className="text-action desktop-action" href="/wishlist">
              Wishlist <span className="count-badge">{wishlistCount}</span>
            </Link>
            <button className="text-action" type="button" onClick={openCart}>
              Bag <span className="count-badge">{cartCount}</span>
            </button>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        wishlistCount={wishlistCount}
        menuRef={mobileRef}
        onClose={closeMobile}
        onSearch={openSearch}
      />
    </>
  );
}
