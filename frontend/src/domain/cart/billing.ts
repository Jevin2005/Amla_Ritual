import type { CartItem } from "@/features/store/store-provider";

type BillingLine = Pick<CartItem,
  "quantity" | "pricePaise" | "compareAtPricePaise" | "lineSubtotalPaise" | "lineTotalPaise" | "discountAmountPaise"
>;

export function formatBillingCurrency(paise: number, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
  }).format(paise / 100);
}

export function calculateLineBilling(item: BillingLine) {
  // Use the selected cart variant's MRP, never another variant's catalog price.
  const mrpPaise = Math.max(item.lineSubtotalPaise, (item.compareAtPricePaise ?? item.pricePaise) * item.quantity);
  // Allocations include order-level offers, which may not be in the line cost.
  const totalPaise = Math.max(0, Math.min(item.lineTotalPaise, item.lineSubtotalPaise - item.discountAmountPaise));
  return {
    mrpPaise,
    totalPaise,
    savingsPaise: Math.max(0, mrpPaise - totalPaise),
    saleSavingsPaise: Math.max(0, mrpPaise - item.lineSubtotalPaise),
  };
}

export function calculateCartBilling({ items, totalPaise, discountAmountPaise, shippingFeePaise = 0 }: {
  items: readonly BillingLine[];
  totalPaise: number;
  discountAmountPaise: number;
  shippingFeePaise?: number;
}) {
  const merchandiseSubtotalPaise = items.reduce((sum, item) => sum + item.lineSubtotalPaise, 0);
  const mrpPaise = items.reduce((sum, item) => sum + calculateLineBilling(item).mrpPaise, 0);
  const lineDiscountPaise = items.reduce((sum, item) => sum + item.lineSubtotalPaise - calculateLineBilling(item).totalPaise, 0);
  // Product prices include tax. Preserve additional order discounts, but do not
  // add an upstream tax/fee difference on top of these inclusive prices.
  const discountPaise = Math.min(merchandiseSubtotalPaise, Math.max(discountAmountPaise, lineDiscountPaise, merchandiseSubtotalPaise - totalPaise));
  const saleSavingsPaise = mrpPaise - merchandiseSubtotalPaise;
  const merchandiseTotalPaise = merchandiseSubtotalPaise - discountPaise;

  return {
    mrpPaise,
    saleSavingsPaise,
    merchandiseSubtotalPaise,
    discountPaise,
    merchandiseTotalPaise,
    shippingFeePaise,
    totalPaise: merchandiseTotalPaise + shippingFeePaise,
    totalSavingsPaise: saleSavingsPaise + discountPaise,
  };
}

export type CartBilling = ReturnType<typeof calculateCartBilling>;
