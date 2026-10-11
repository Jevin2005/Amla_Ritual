"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/features/store/store-provider";
import { installWheelScroll } from "./wheel-scroll";

export function SmoothScroll() {
  const pathname = usePathname();
  const { content: { motionSettings } } = useStore();

  useEffect(() => {
    if (!motionSettings.enabled) return;
    return installWheelScroll(window);
  }, [pathname, motionSettings.enabled]);

  return null;
}
