"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/features/store/store-provider";
import { installLenisScroll } from "./lenis-scroll";

export function SmoothScroll() {
  const pathname = usePathname();
  const { content: { motionSettings } } = useStore();

  useEffect(() => {
    document.documentElement.dataset.siteMotion = motionSettings.enabled ? "on" : "off";
    if (!motionSettings.enabled) return;
    return installLenisScroll(window);
  }, [pathname, motionSettings.enabled]);

  return null;
}
