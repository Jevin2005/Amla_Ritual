import type { ReactNode } from "react";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { SearchDialog } from "@/features/search/components/search-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

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
