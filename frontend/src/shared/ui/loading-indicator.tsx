import styles from "./site-loading.module.css";

export function LoadingIndicator({ label = "Preparing your ritual…", page = false }: { label?: string; page?: boolean }) {
  return (
    <div className={page ? styles.page : styles.indicator} data-page-pending="" role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.emblem} aria-hidden="true">
      <svg className={styles.leaf} viewBox="0 0 48 48" fill="none">
        <path d="M38 9C18 6 8 17 13 30c13 6 26-2 25-21Z" fill="currentColor" fillOpacity=".14" />
        <path d="M38 9C18 6 8 17 13 30c13 6 26-2 25-21ZM9 39 29 19M17 31l-1-10m1 10 10 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      </span>
      <span className={styles.track} aria-hidden="true"><span /></span>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
