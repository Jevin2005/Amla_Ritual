/** Keep old clients from creating payments or orders outside Shopify checkout. */
export function retiredCheckoutResponse() {
  return Response.json(
    {
      success: false,
      verified: false,
      code: "CHECKOUT_RETIRED",
      error:
        "This checkout endpoint is no longer available. Continue with Shopify checkout.",
      checkoutUrl: "/checkout",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
