"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { BrandMark } from "./brand-mark";
import { MobileMenu } from "./mobile-menu";

const interactiveNavClass =
  "relative min-h-11 items-center bg-transparent p-0 text-[0.66rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase after:absolute after:inset-x-0 after:bottom-2 after:h-px after:bg-[var(--forest)] after:transition-[transform] after:duration-[350ms] after:ease-[var(--ease)] after:content-[''] after:[transform:scaleX(0)] after:[transform-origin:right] hover:after:[transform:scaleX(1)] hover:after:[transform-origin:left] focus-visible:after:[transform:scaleX(1)] focus-visible:after:[transform-origin:left]";

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
      <a
        className="fixed top-3 left-3 z-[9999] bg-[var(--paper)] px-[18px] py-[11px] text-[0.8rem] font-bold text-[var(--forest)] transition-[transform] duration-[180ms] ease-[ease] [transform:translateY(-180%)] focus:[transform:translateY(0)]"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="flex min-h-8 items-center justify-center gap-[6vw] bg-[var(--forest-dark)] px-[4vw] py-1.5 text-[0.61rem] font-[650] tracking-[0.16em] text-[rgba(255,255,255,0.82)] uppercase max-[680px]:min-h-[29px] max-[680px]:px-2.5 max-[680px]:text-[0.54rem] max-[680px]:tracking-[0.11em]">
        <p className="m-0">
          Rooted in Ayurveda{" "}
          <span className="mx-2 text-[var(--amla)]" aria-hidden="true">
            •
          </span>{" "}
          Made for modern rituals
        </p>
        <Link
          className="border-b border-[rgba(255,255,255,0.5)] max-[900px]:hidden"
          href="/rituals"
        >
          Find your ritual <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <header
        className={`sticky top-0 z-[100] border-b border-[rgba(23,63,42,0.12)] bg-[rgba(247,244,232,0.92)] backdrop-blur-[16px] transition-[height,box-shadow] duration-[420ms] ease-[var(--ease)] ${
          compact
            ? "h-[66px] shadow-[0_12px_35px_rgba(23,63,42,0.08)] max-[680px]:h-[60px]"
            : "h-[var(--header-height)]"
        }`}
      >
        <nav
          className="mx-auto grid h-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-[clamp(24px,4vw,72px)] max-[900px]:grid-cols-[1fr_auto] max-[680px]:px-[18px]"
          aria-label="Primary navigation"
        >
          <div className="flex items-center gap-[clamp(20px,2.5vw,42px)] max-[1180px]:gap-[18px] max-[900px]:hidden">
            <Link className={`inline-flex ${interactiveNavClass}`} href="/shop">
              Shop
            </Link>
            <Link className={`inline-flex ${interactiveNavClass}`} href="/rituals">
              Rituals
            </Link>
            <Link className={`inline-flex ${interactiveNavClass}`} href="/our-story">
              Our Story
            </Link>
          </div>
          <Link
            className="px-6 py-2.5 max-[900px]:col-start-1 max-[900px]:justify-self-start max-[900px]:pl-0 max-[680px]:py-1.5"
            href="/"
          >
            <BrandMark />
          </Link>
          <div className="flex items-center justify-end gap-[clamp(20px,2.5vw,42px)] max-[1180px]:gap-4 max-[900px]:col-start-2">
            <button
              className={`inline-flex gap-2 max-[900px]:hidden max-[680px]:text-[0.6rem] ${interactiveNavClass}`}
              type="button"
              onClick={openSearch}
            >
              Search
            </button>
            <Link
              className={`inline-flex gap-2 max-[900px]:hidden max-[680px]:text-[0.6rem] ${interactiveNavClass}`}
              href="/wishlist"
            >
              Wishlist{" "}
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[99px] bg-[var(--forest)] text-[0.58rem] tracking-normal text-[var(--paper)]">
                {wishlistCount}
              </span>
            </Link>
            <button
              className={`inline-flex gap-2 max-[680px]:text-[0.6rem] ${interactiveNavClass}`}
              type="button"
              onClick={openCart}
            >
              Bag{" "}
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[99px] bg-[var(--forest)] text-[0.58rem] tracking-normal text-[var(--paper)]">
                {cartCount}
              </span>
            </button>
            <button
              className="hidden h-11 w-11 flex-col items-center justify-center gap-1.5 bg-transparent max-[900px]:flex max-[680px]:mr-[-8px]"
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <span className="h-px w-[21px] bg-[var(--forest)]" />
              <span className="h-px w-[21px] bg-[var(--forest)]" />
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
