"use client";

import type { ReactNode } from "react";
import { usePointerMotion } from "@/shared/hooks/use-pointer-motion";
import styles from "./motion.module.css";

export function MotionImage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const pointer = usePointerMotion<HTMLDivElement>();
  return (
    <div {...pointer} className={`${styles.imageFrame} ${className}`} data-motion-reveal="image">
      <div className={styles.imageContent}>{children}</div>
    </div>
  );
}
