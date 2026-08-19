"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { BrandMark } from "./brand-mark";
import { MobileMenu } from "./mobile-menu";

const interactiveNavClass =
  "relative inline-flex min-h-11 items-center justify-center whitespace-nowrap bg-transparent px-0.5 py-0 text-[0.7rem] font-bold tracking-[0.115em] text-[var(--forest)] uppercase after:absolute after:inset-x-0.5 after:bottom-1.5 after:h-px after:bg-[var(--forest)] after:transition-[transform] after:duration-[350ms] after:ease-[var(--ease)] after:content-[''] after:[transform:scaleX(0)] after:[transform-origin:right] hover:after:[transform:scaleX(1)] hover:after:[transform-origin:left] focus-visible:after:[transform:scaleX(1)] focus-visible:after:[transform-origin:left] aria-[current=page]:after:[transform:scaleX(1)] aria-[current=page]:after:[transform-origin:left]";

const primaryNavigation = [
  { href: "/shop", label: "Shop" },
  { href: "/rituals", label: "Rituals" },
  { href: "/our-story", label: "Our Story" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const { cartCount, wishlist, openCart, openSearch } = useStore();
  const pathname = usePathname();
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

  useEffect(() => {
    const desktopNavigation = window.matchMedia("(min-width: 901px)");
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    desktopNavigation.addEventListener("change", handleBreakpointChange);
    return () =>
      desktopNavigation.removeEventListener("change", handleBreakpointChange);
  }, []);

  useModalFocus(mobileOpen, mobileRef, closeMobile);

  return (
    <>
      <a
        className="fixed left-[max(12px,env(safe-area-inset-left))] top-[max(12px,env(safe-area-inset-top))] z-[9999] inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--paper)] px-[18px] py-[11px] text-[0.8rem] font-bold text-[var(--forest)] shadow-[var(--shadow-float)] transition-[transform] duration-[180ms] ease-[ease] [transform:translateY(calc(-100%_-_max(24px,env(safe-area-inset-top))))] focus:[transform:translateY(0)]"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="bg-[linear-gradient(90deg,var(--forest-dark),var(--forest))] text-white/84 max-[680px]:pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-9 w-full max-w-[1440px] items-center justify-between gap-8 px-[clamp(20px,3.35vw,48px)] py-1.5 text-[0.66rem] font-[650] tracking-[0.14em] uppercase max-[900px]:justify-center max-[680px]:min-h-[32px] max-[680px]:pr-[max(12px,env(safe-area-inset-right))] max-[680px]:pl-[max(12px,env(safe-area-inset-left))] max-[680px]:text-[0.62rem] max-[680px]:tracking-[0.075em]">
          <p className="m-0 text-center">
            Rooted in Ayurveda{" "}
            <span className="mx-2 text-[var(--amla)]" aria-hidden="true">
              •
            </span>{" "}
            Made for modern rituals
          </p>
          <Link
            className="shrink-0 border-b border-[rgba(255,255,255,0.5)] transition-colors hover:border-white hover:text-white max-[900px]:hidden"
            href="/rituals"
          >
            Find your ritual <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <header
        className={`sticky top-0 z-[100] border-b border-[var(--line)] bg-[rgba(245,241,232,0.9)] backdrop-blur-[18px] transition-[height,box-shadow,background-color] duration-[420ms] ease-[var(--ease)] max-[900px]:h-[70px] max-[680px]:h-[60px] ${
          compact
            ? "h-[68px] bg-[rgba(255,252,245,0.94)] shadow-[0_12px_35px_rgba(21,59,45,0.09)] max-[900px]:h-[64px] max-[680px]:h-[60px]"
            : "h-[var(--header-height)]"
        }`}
      >
        <nav
          className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-[clamp(20px,3.35vw,48px)] max-[900px]:pr-[max(18px,env(safe-area-inset-right))] max-[900px]:pl-[max(18px,env(safe-area-inset-left))] max-[680px]:pr-[max(16px,env(safe-area-inset-right))] max-[680px]:pl-[max(16px,env(safe-area-inset-left))]"
          aria-label="Primary navigation"
        >
          <div className="flex min-w-0 items-center gap-[clamp(20px,2.5vw,42px)] max-[1180px]:gap-[18px] max-[900px]:hidden">
            {primaryNavigation.map((item) => (
              <Link
                className={interactiveNavClass}
                href={item.href}
                aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            className="hidden h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 border border-transparent bg-transparent transition-colors hover:border-[var(--line)] hover:bg-[var(--paper)] max-[900px]:col-start-1 max-[900px]:row-start-1 max-[900px]:flex max-[900px]:justify-self-start"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
          >
            <span className="h-px w-[21px] bg-[var(--forest)]" />
            <span className="h-px w-[21px] bg-[var(--forest)]" />
          </button>
          <Link
            className="z-10 justify-self-center px-6 py-2.5 max-[900px]:col-start-2 max-[900px]:row-start-1 max-[900px]:px-1 max-[900px]:py-1"
            href="/"
            aria-label="NatureMist home"
          >
            <BrandMark />
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-[clamp(20px,2.5vw,42px)] max-[1180px]:gap-4 max-[900px]:col-start-3 max-[900px]:row-start-1 max-[900px]:justify-self-end max-[900px]:gap-0">
            <button
              className={`gap-2 max-[900px]:hidden ${interactiveNavClass}`}
              type="button"
              onClick={openSearch}
            >
              Search
            </button>
            <Link
              className={`gap-2 max-[900px]:hidden ${interactiveNavClass}`}
              href="/wishlist"
              aria-current={pathname === "/wishlist" ? "page" : undefined}
            >
              Wishlist{" "}
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-[99px] bg-[var(--forest)] px-1 text-[0.62rem] tracking-normal text-[var(--paper)]"
                aria-live="polite"
                aria-atomic="true"
              >
                <span aria-hidden="true">{wishlistCount}</span>
                <span className="sr-only">
                  {wishlistCount} saved {wishlistCount === 1 ? "item" : "items"}
                </span>
              </span>
            </Link>
            <button
              className={`gap-2 max-[900px]:px-1 max-[900px]:text-[0.64rem] ${interactiveNavClass}`}
              type="button"
              onClick={openCart}
            >
              Bag{" "}
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-[99px] bg-[var(--forest)] px-1 text-[0.62rem] tracking-normal text-[var(--paper)]"
                aria-live="polite"
                aria-atomic="true"
              >
                <span aria-hidden="true">{cartCount}</span>
                <span className="sr-only">
                  {cartCount} {cartCount === 1 ? "item" : "items"} in bag
                </span>
              </span>
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        wishlistCount={wishlistCount}
        currentPath={pathname}
        menuRef={mobileRef}
        onClose={closeMobile}
        onSearch={openSearch}
      />
    </>
  );
}
