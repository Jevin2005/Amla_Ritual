"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePointerMotion } from "@/shared/hooks/use-pointer-motion";
import styles from "./motion.module.css";

type MagneticLinkProps = Omit<ComponentProps<typeof Link>, "ref"> & { motionEnabled?: boolean };

export function MagneticLink({ children, className = "", motionEnabled = true, ...props }: MagneticLinkProps) {
  const pointer = usePointerMotion<HTMLAnchorElement>(motionEnabled);
  return (
    <Link {...props} {...pointer} className={`${styles.magnetic} ${className}`}>
      <span className={styles.magneticContent}>{children}</span>
    </Link>
  );
}
