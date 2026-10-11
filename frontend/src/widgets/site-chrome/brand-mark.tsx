import styles from "./brand-mark.module.css";

type BrandMarkProps = {
  variant?: "default" | "footer" | "hero";
  compact?: boolean;
};

export function BrandMark({ variant = "default", compact = false }: BrandMarkProps) {
  return (
    <span className={styles.mark} data-variant={variant} data-compact={compact}>
      <span className={styles.leaf} aria-hidden="true" />
      <span className={styles.wordmark}>NatureMist</span>
      <span className={styles.tagline}>Botanical Rituals</span>
    </span>
  );
}
