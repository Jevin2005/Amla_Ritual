/* Superseded prototype. Not installed or connected to Shopify. Do not install.
 * The official Google & YouTube app is the selected checkout integration.
 * Google does not support Google tags inside Shopify custom pixels.
 * Keep the marker intact; known shipping/attribution limitations remain.
 * Never run alongside the official app or another GA4 purchase emitter.
 * This is sandbox JavaScript, not a theme script or a Next.js component.
 */
(() => {
  const measurementId = "__GA4_MEASUREMENT_ID__";
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  let allowed = init.customerPrivacy?.analyticsProcessingAllowed === true;
  let consentRevision = 0;
  let started = false;
  let pending = Promise.resolve();
  const seen = new Set();
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  api.customerPrivacy.subscribe("visitorConsentCollected", (event) => {
    const next = event.customerPrivacy?.analyticsProcessingAllowed === true;
    if (allowed !== next) consentRevision += 1;
    allowed = next;
    window[`ga-disable-${measurementId}`] = !allowed;
    if (started) gtag("consent", "update", { analytics_storage: allowed ? "granted" : "denied" });
  });

  function start() {
    if (started || !allowed) return;
    gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: "https://checkout.naturemist.shop/checkout", page_referrer: "", page_title: "Secure checkout",
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    started = true;
  }

  function amount(money, currency) {
    if (!money || money.amount === null || money.amount === undefined || money.currencyCode !== currency) return null;
    const value = Number(money.amount);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function shopifyId(value, type) {
    const id = String(value || "");
    if (/^\d+$/.test(id)) return `gid://shopify/${type}/${id}`;
    return new RegExp(`^gid://shopify/${type}/\\d+$`).test(id) ? id : null;
  }

  function payloadFor(checkout) {
    const currency = checkout?.currencyCode;
    if (!/^[A-Z]{3}$/.test(currency || "") || !checkout.lineItems?.length) return null;
    const items = [];
    for (const line of checkout.lineItems) {
      const product = line.variant?.product;
      const productId = shopifyId(product?.id, "Product");
      const total = amount(line.finalLinePrice, currency);
      if (!productId || !Number.isInteger(line.quantity) || line.quantity < 1 || total === null) return null;
      items.push({
        item_id: productId, item_name: product.title, item_category: product.type || "Botanical care",
        item_variant: line.variant.title, price: total / line.quantity, quantity: line.quantity,
      });
    }
    const value = amount(checkout.subtotalPrice, currency);
    if (value === null) return null;
    // Do not silently report a mismatched item/revenue total (for example unsupported discount data).
    const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (Math.abs(itemTotal - value) > 0.02) return null;
    return { currency, value, items };
  }

  function subscribe(shopifyName, gaName) {
    analytics.subscribe(shopifyName, (event) => {
      if (!allowed) return;
      const revision = consentRevision;
      pending = pending.then(async () => {
        if (!allowed || revision !== consentRevision) return;
        const checkout = event.data?.checkout;
        const payload = payloadFor(checkout);
        if (!payload || !event.id) return;
        const purchase = gaName === "purchase";
        const orderId = shopifyId(checkout.order?.id, "Order");
        if (purchase && !orderId) return;
        const key = purchase ? `naturemist:ga4:${measurementId}:purchase:${orderId}` : event.id;
        if (seen.has(key)) return;
        if (purchase) {
          try { if (await browser.localStorage.getItem(key)) return; } catch { /* GA4 also deduplicates transaction_id. */ }
        }
        if (!allowed || revision !== consentRevision) return;
        start();
        seen.add(key);
        // Store the enqueue marker before emitting. This prevents callback/refresh replay,
        // but does not claim delivery in the presence of ad blockers or network failures.
        if (purchase) {
          try { await browser.localStorage.setItem(key, "queued"); } catch { /* In-memory guard remains active. */ }
        }
        if (!allowed || revision !== consentRevision) return;
        gtag("event", gaName, {
          ...payload,
          ...(purchase ? {
            transaction_id: orderId,
            tax: amount(checkout.totalTax, payload.currency) ?? undefined,
            shipping: amount(checkout.shippingLine?.price, payload.currency) ?? undefined,
          } : {}),
          page_location: "https://checkout.naturemist.shop/checkout",
          page_referrer: "", page_title: "Secure checkout", send_to: measurementId,
        });
      }).catch(() => { /* Tracking must not affect checkout. */ });
      return pending;
    });
  }

  // The storefront owns begin_checkout at its validated handoff. Shopify arrival
  // uses a different name so the same attempt is not counted twice.
  subscribe("checkout_started", "shopify_checkout_started");
  subscribe("checkout_shipping_info_submitted", "add_shipping_info");
  subscribe("payment_info_submitted", "add_payment_info");
  subscribe("checkout_completed", "purchase");
  // Refund is intentionally absent: a browser visit is not an authoritative refund.
})();
