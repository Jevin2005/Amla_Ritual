import { formatBillingCurrency, type CartBilling } from "@/domain/cart/billing";
import styles from "./cart-bill-summary.module.css";

export function CartBillSummary({ billing, currencyCode, estimated = false, shippingPending = false, taxPending = false, busy = false }: {
  billing: CartBilling;
  currencyCode: string;
  estimated?: boolean;
  shippingPending?: boolean;
  taxPending?: boolean;
  busy?: boolean;
}) {
  const money = (amount: number) => formatBillingCurrency(amount, currencyCode);

  return (
    <section className={styles.bill} aria-label="Price details" aria-busy={busy}>
      <h3 className={styles.heading}>Price details</h3>
      <dl className={styles.rows}>
        {billing.saleSavingsPaise > 0 && <>
          <div><dt>Total MRP</dt><dd>{money(billing.mrpPaise)}</dd></div>
          <div className={styles.savings}><dt>Product savings</dt><dd>−{money(billing.saleSavingsPaise)}</dd></div>
        </>}
        <div className={styles.subtotal}><dt>Subtotal</dt><dd>{money(billing.merchandiseSubtotalPaise)}</dd></div>
        {billing.discountPaise > 0 && <div className={styles.savings}><dt>Applied discounts</dt><dd>−{money(billing.discountPaise)}</dd></div>}
        <div><dt>Taxes</dt><dd>{taxPending ? "Confirmed at checkout" : "Included in price"}</dd></div>
        <div><dt>Delivery</dt><dd className={shippingPending ? styles.pending : undefined}>{shippingPending ? "At checkout" : billing.shippingFeePaise === 0 ? "FREE" : money(billing.shippingFeePaise)}</dd></div>
        <div className={styles.total} aria-live="polite" aria-atomic="true">
          <dt>{estimated || shippingPending || taxPending ? "Estimated total" : "Total payable"}<span>{busy ? "Updating amounts…" : "After all discounts"}</span></dt>
          <dd>{money(billing.totalPaise)}</dd>
        </div>
      </dl>
      {billing.totalSavingsPaise > 0 && <p className={styles.saved}>You save <strong>{money(billing.totalSavingsPaise)}</strong> on this order</p>}
    </section>
  );
}
