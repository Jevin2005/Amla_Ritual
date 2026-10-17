"use client";

import type { CollectionKind } from "@/domain/collection-catalog";
import styles from "./collection-type-filter.module.css";

const options: { value: CollectionKind; label: string }[] = [
  { value: "all", label: "All products" },
  { value: "individual", label: "Individual powders" },
  { value: "combos", label: "Combos" },
];

export function CollectionTypeFilter({ value, onChange, counts }: {
  value: CollectionKind;
  onChange: (value: CollectionKind) => void;
  counts: Record<CollectionKind, number>;
}) {
  return <div className={styles.filters} role="group" aria-label="Filter by product type">
    {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
      <span>{option.label}</span><span className={styles.count}>{counts[option.value]}</span>
    </button>)}
  </div>;
}
