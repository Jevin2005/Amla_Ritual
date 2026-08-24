import type { ReactNode } from "react";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { SearchDialog } from "@/features/search/search-dialog";
import { MotionObserver } from "@/shared/ui/motion-observer";
import { BotanicalAtmosphere } from "./botanical-atmosphere";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <MotionObserver />
      <BotanicalAtmosphere />
      <SiteHeader />
      {children}
      <SiteFooter />
      <SearchDialog />
      <CartDrawer />
    </>
  );
}
