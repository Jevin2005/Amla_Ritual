// Local diagnostic only. All network calls and credentials are mocked.
// Run from the repository root: node docs/product-information/audit-evidence-2026-10-25/check-handlers.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';

const env = { RAZORPAY_KEY_ID: 'rzp_test_audit', RAZORPAY_KEY_SECRET: 'audit-only-secret' };
const ok = (body) => ({ ok: true, status: 200, json: async () => body });
function handler(file, fetch) {
  const source = fs.readFileSync(new URL(`../../../frontend/src/app/api/${file}/route.ts`, import.meta.url), 'utf8');
  const bundle = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const testModule = { exports: {} };
  vm.runInNewContext(bundle.outputText, {
    module: testModule, exports: testModule.exports, process: { env }, Buffer, fetch,
    console: { log() {}, warn() {}, error() {} },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } };
      if (name === 'crypto') return crypto;
      if (name === '@/lib/shopify/admin-auth') return { adminDomain: () => 'audit.myshopify.com', requireOrderAccess: async () => 'mock', getAdminToken: async () => 'mock' };
      if (name === '@/shared/config/support') return { SUPPORT_MESSAGE: 'Mock support' };
      throw Error(`Unmocked import: ${name}`);
    },
  });
  return testModule.exports.POST;
}

const evidence = [];
const signature = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update('order_audit|pay_audit').digest('hex');
const proof = { razorpayOrderId: 'order_audit', razorpayPaymentId: 'pay_audit', razorpaySignature: signature };
let sent;
const create = handler('razorpay/create-order', async (_url, init) => {
  sent = JSON.parse(init.body);
  return ok({ id: 'order_audit', amount: sent.amount, currency: sent.currency });
});
await create({ json: async () => ({ amountPaise: 100 }) });
assert.equal(sent.amount, 100);
evidence.push('Client amount is used without a server cart lookup');

const verify = handler('razorpay/verify-payment', async () => ({ ok: false, status: 503 }));
const verification = await verify({ json: async () => proof });
assert.equal(verification.body.verified, true);
assert.equal(verification.body.status, 'captured');
evidence.push('Payment lookup HTTP 503 still returns verified/captured');

const orders = [];
const orderUrls = [];
const order = handler('shopify/order', async (url, init) => {
  orderUrls.push(url);
  orders.push(JSON.parse(init.body));
  return ok({ order: { id: orders.length, name: '#AUDIT' } });
});
const payload = {
  customer: { email: 'audit@example.invalid', phone: '9999999999', firstName: 'Audit', lastName: 'Only' },
  deliveryAddress: { firstName: 'Audit', lastName: 'Only', address1: 'Mock', city: 'Mock', province: 'Mock', zip: '123456', country: 'India' },
  items: [{ name: 'Mock', variantId: 'gid://shopify/ProductVariant/123', quantity: 1, pricePaise: 100 }],
  paymentMethod: 'shopify', shippingMethod: 'standard', shippingFeePaise: 0, totalPaise: 100, ...proof,
};
await order({ json: async () => payload });
await order({ json: async () => payload });
assert.equal(orders.length, 2);
assert.equal(orders[0].order.financial_status, 'paid');
assert.equal(orders[0].order.line_items[0].price, '1.00');
assert.ok(orderUrls.every((url) => url.includes('orders.json')));
evidence.push('Repeated proof creates two paid orders with client price and no gateway lookup');

const bypass = await order({ json: async () => ({ ...payload, paymentMethod: 'unknown', razorpayPaymentId: undefined, razorpayOrderId: undefined, razorpaySignature: undefined }) });
assert.equal(bypass.status, 200);
assert.equal(orders[2].order.financial_status, 'pending');
evidence.push('Unknown payment method creates a pending order with COD disabled');
assert.ok(['inventory_behaviour', 'tax_lines', 'discount_codes', 'transactions'].every((key) => !(key in orders[0].order)));
assert.equal(orders[0].inventory_behaviour, undefined);
evidence.push('Order payload omits inventory behaviour, explicit tax lines, discount codes and transactions');

const buyer = handler('reviews/verify-buyer', async () => ok({ orders: [{ id: 1234567890123, email: 'audit@example.invalid', customer: { first_name: 'Audit' }, line_items: [{ title: 'Unrelated item' }] }] }));
const leak = await buyer({ json: async () => ({ email: 'audit@example.invalid', productSlug: 'amla-powder' }) });
assert.equal(leak.body.verified, true);
assert.equal(leak.body.orderId, '1234567890123');
evidence.push('Slug-only verification matches an unrelated purchase and discloses order ID without email ownership');

const tracking = handler('shopify/track-order', async () => ok({ order: {
  id: 1234567890123, total_price: '234.00', line_items: [{ title: 'Mock', quantity: 1, price: '234.00' }],
  shipping_address: { city: 'Mock City', zip: '123456' }, financial_status: 'paid', fulfillment_status: 'fulfilled',
  fulfillments: [{ status: 'success', shipment_status: 'delivered' }],
} }));
const exposed = await tracking({ json: async () => ({ reference: '1234567890123' }) });
assert.equal(exposed.body.order.pinCode, '123456');
evidence.push('Order ID alone returns purchase and destination postcode');
assert.equal(exposed.body.order.milestones.find((milestone) => milestone.id === 'delivered').status, 'pending');
evidence.push('A delivered shipment is shown as pending because the wrong field is checked');

console.log(JSON.stringify({ diagnostic: 'Current unsafe behavior reproduced with mocks; these are not security acceptance tests', checks: evidence.length, evidence }, null, 2));
