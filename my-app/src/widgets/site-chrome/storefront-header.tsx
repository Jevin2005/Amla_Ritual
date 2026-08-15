"use client";

import { useStore } from "@/features/store/store-provider";
import { SiteHeader as SiteHeaderView } from "@/shared/layout/site-header";

export function SiteHeader() {
  const { cartCount, wishlist, openCart, openSearch } = useStore();

  return (
    <SiteHeaderView
      cartCount={cartCount}
      wishlistCount={wishlist.length}
      onOpenCart={openCart}
      onOpenSearch={openSearch}
    />
  );
}
