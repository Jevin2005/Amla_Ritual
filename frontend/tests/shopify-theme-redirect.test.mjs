import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const snippet = readFileSync(new URL("../../docs/shopify-checkout-only.liquid", import.meta.url), "utf8");
const script = snippet.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "The deployment snippet must contain its browsing redirect script");

const shopifyOrigin = "https://checkout.naturemist.shop";
const storefront = "https://naturemist.shop";

function visit(path, localeRoot = "/") {
  const originalUrl = shopifyOrigin + path;
  const location = new URL(originalUrl);
  const navigations = [];
  location.replace = (destination) => {
    navigations.push(destination);
    location.href = new URL(destination, location.href).href;
  };
  const renderedScript = script.replace("{{ routes.root_url | json }}", JSON.stringify(localeRoot));
  runInNewContext(renderedScript, { window: { location } });
  return { originalUrl, finalUrl: location.href, navigations };
}

const browsingCases = [
  ["Shopify home returns to the main website", "/", "/", storefront],
  ["standalone Shopify cart returns to the main checkout", "/cart", "/", storefront + "/checkout"],
  ["cart trailing slash still returns to the main checkout", "/cart/", "/", storefront + "/checkout"],
  ["product browsing returns to its main-site product", "/products/amla-powder", "/", storefront + "/shop/amla-powder"],
  ["collection product links return to the main-site product", "/collections/hair/products/amla-powder", "/", storefront + "/shop/amla-powder"],
  ["Shopify search returns to the main catalog", "/search?q=amla", "/", storefront + "/shop"],
  ["localized cart returns to the main checkout", "/en-in/cart", "/en-in/", storefront + "/checkout"],
  ["localized product returns to the main-site product", "/en-in/products/amla-powder", "/en-in", storefront + "/shop/amla-powder"],
  ["cart-like page names do not bypass the browsing restriction", "/cartoon", "/", storefront],
  ["account-like page names do not bypass the browsing restriction", "/accounting", "/", storefront],
  ["unknown pages return home without forwarding untrusted redirect parameters", "/unknown?return_to=https%3A%2F%2Fexample.invalid%2F", "/", storefront],
];

for (const [name, path, localeRoot, destination] of browsingCases) {
  test(name, () => {
    const result = visit(path, localeRoot);
    assert.deepEqual(result.navigations, [destination]);
    assert.equal(result.finalUrl, new URL(destination).href);
    assert.equal(new URL(result.finalUrl).origin, storefront);
  });
}

const preservedCases = [
  ["Storefront checkout handoff preserves its token, secret query and fragment", "/cart/c/token?key=a%2Fb%2Bc&locale=en-IN#contact", "/"],
  ["checkout entry remains on Shopify", "/checkout?discount=RITUAL10", "/"],
  ["checkout payment steps retain their complete URL", "/checkouts/cn/token?key=secret%2Bvalue&step=payment_method#payment", "/"],
  ["order status stays on Shopify with its access token", "/orders/token?authenticate=key%2Fvalue", "/"],
  ["legacy order status with numeric shop ID stays on Shopify", "/123/orders/token?key=order-key", "/"],
  ["checkout legal policy links stay accessible", "/policies/refund-policy?locale=en-IN", "/"],
  ["customer authentication retains its state and return path", "/customer_authentication/login?state=abc%2Bdef&return_to=%2Fcheckouts%2Fcn%2Ftoken", "/"],
  ["legacy account login retains its return URL", "/account/login?return_url=%2Fcheckouts%2Fcn%2Ftoken", "/"],
  ["Shopify challenge retains its challenge token", "/challenge?token=abc%2F123", "/"],
  ["payment and login service callbacks remain untouched", "/services/login_with_shop/authorize?state=state%2Bvalue&code=callback-code", "/"],
  ["localized Storefront handoff keeps its locale and secret query", "/en-in/cart/c/token?key=a%2Fb%2Bc#contact", "/en-in"],
];

for (const [name, path, localeRoot] of preservedCases) {
  test(name, () => {
    const result = visit(path, localeRoot);
    assert.deepEqual(result.navigations, []);
    assert.equal(result.finalUrl, result.originalUrl);
  });
}
