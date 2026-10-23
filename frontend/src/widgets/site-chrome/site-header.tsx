"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { getImageHeroProducts } from "@/domain/catalog/image-hero";
import { BrandMark } from "./brand-mark";
import { MobileMenu } from "./mobile-menu";
import styles from "./site-header.module.css";

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SiteHeader() {
  const { content, products, cartCount, wishlist, openCart, openSearch, isSearchOpen } = useStore();
  const pathname = usePathname();
  const ritualHeader = pathname === "/" && getImageHeroProducts(products).length > 0;
  const [compact, setCompact] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;
  const mobileRef = useRef<HTMLElement>(null);
  const closeMobile = useCallback(() => setMenuPath(null), []);

  useEffect(() => {
    const onScroll = () => {
      const hero = ritualHeader ? document.querySelector("[data-ritual-hero]") : null;
      const incoming = hero?.getAttribute("data-handoff") === "true" && hero.getAttribute("data-reduced-motion") !== "true"
        ? hero.nextElementSibling : null;
      setCompact(incoming ? incoming.getBoundingClientRect().top < window.innerHeight * 0.22
        : hero ? hero.getBoundingClientRect().bottom < 100 : window.scrollY > 28);
    };
    onScroll();
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ritualHeader, pathname]);

  useModalFocus(mobileOpen, mobileRef, closeMobile);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.header} data-compact={compact} data-overlay={ritualHeader} data-ritual-header={ritualHeader ? "" : undefined}>
        <nav className={styles.navigation} aria-label="Primary navigation">
          <div className={styles.desktopLinks}>
            {content.primaryNavigation.slice(0, 2).map((item) => (
              <Link className={styles.navLink} href={item.url} aria-current={isCurrentPath(pathname, item.url) ? "page" : undefined} key={item.id}>
                {item.title}
              </Link>
            ))}
            <Link className={styles.navLink} href="/wishlist" aria-current={pathname === "/wishlist" ? "page" : undefined}>
              Wishlist <span className={styles.count} aria-label={`${wishlist.length} saved items`}>{wishlist.length}</span>
            </Link>
          </div>
          <Link className={styles.brand} href="/" aria-label="NatureMist home">
            <BrandMark variant="hero" />
          </Link>
          <div className={styles.actions}>
            <button className={styles.search} type="button" onClick={openSearch} aria-label="Open search" aria-haspopup="dialog" aria-expanded={isSearchOpen} aria-controls="site-search-dialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>
              <span>Search</span>
            </button>
            <button className={styles.bag} type="button" onClick={openCart} aria-label={`Open bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} aria-haspopup="dialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z" strokeLinejoin="round" /><path d="M8 8V6a4 4 0 0 1 8 0v2" strokeLinecap="round" /></svg>
              <span>Bag</span><span className={styles.count} aria-live="polite" aria-atomic="true">{cartCount}</span>
            </button>
            <button className={styles.menu} type="button" onClick={() => setMenuPath(pathname)} aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-haspopup="dialog">
              <span className={styles.menuLabel}>Menu</span>
              <span className={styles.menuLines} aria-hidden="true"><i /><i /></span>
              {cartCount > 0 && <span className={styles.mobileBagCount} aria-hidden="true">{cartCount}</span>}
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={mobileOpen} navigationItems={content.primaryNavigation} wishlistCount={wishlist.length} currentPath={pathname} menuRef={mobileRef} onClose={closeMobile} onSearch={openSearch} desktop onCart={openCart} cartCount={cartCount} />
    </>
  );
}
