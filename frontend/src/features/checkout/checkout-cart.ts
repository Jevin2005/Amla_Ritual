import type { CartItem, StoreCart } from "@/features/store/store-provider";

type CheckoutCart = Pick<
  StoreCart,
  "items" | "subtotalPaise" | "totalPaise" | "discountAmountPaise" | "currencyCode"
>;

function checkoutLines(items: CartItem[]) {
  return items.map((item) => ({
    lineId: item.lineId,
    slug: item.slug,
    productName: item.productName,
    variantId: item.variantId,
    variantTitle: item.variantTitle,
    quantity: item.quantity,
    availableForSale: item.availableForSale,
    pricePaise: item.pricePaise,
    compareAtPricePaise: item.compareAtPricePaise,
    lineSubtotalPaise: item.lineSubtotalPaise,
    lineTotalPaise: item.lineTotalPaise,
    discountAmountPaise: item.discountAmountPaise,
    currencyCode: item.currencyCode,
  })).sort((left, right) => left.lineId.localeCompare(right.lineId));
}

// Buyer/address updates can change prices, discounts, availability, or currency.
// Require the customer to review those changes before starting any payment.
export function hasCheckoutCartChanged(previous: CheckoutCart, refreshed: CheckoutCart) {
  return previous.totalPaise !== refreshed.totalPaise
    || previous.subtotalPaise !== refreshed.subtotalPaise
    || previous.discountAmountPaise !== refreshed.discountAmountPaise
    || previous.currencyCode !== refreshed.currencyCode
    || JSON.stringify(checkoutLines(previous.items)) !== JSON.stringify(checkoutLines(refreshed.items));
}
