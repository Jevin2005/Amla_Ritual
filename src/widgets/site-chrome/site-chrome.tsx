import type { ReactNode } from "react";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { SearchDialog } from "@/features/search/components/search-dialog";
import { SiteFooter } from "./storefront-footer";
import { SiteHeader } from "./storefront-header";

export { CartDrawer, SearchDialog, SiteFooter, SiteHeader };

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <SearchDialog />
      <CartDrawer />
    </>
  );
}
