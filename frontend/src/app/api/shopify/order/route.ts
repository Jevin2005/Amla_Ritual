import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderRequestPayload = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  items: Array<{
    name: string;
    variant?: string;
    quantity: number;
    pricePaise: number;
    slug?: string;
  }>;
  paymentMethod: "cod" | "upi" | "shopify";
  shippingMethod: "standard" | "express";
  shippingFeePaise: number;
  totalPaise: number;
  currencyCode?: string;
  discountCode?: string;
  razorpayPaymentId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as OrderRequestPayload;

    if (!payload.customer?.email || !payload.customer?.phone || !payload.items?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required order details." },
        { status: 400 },
      );
    }

    const domain =
      process.env.SHOPIFY_STORE_DOMAIN || "amla-ritual.myshopify.com";

    // ── Permanent Token Resolution (Auto-Refreshes Forever via Client ID + Secret) ──
    let adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN || null;

    if (!adminToken && process.env.SHOPIFY_CLIENT_ID && (process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_APP_SECRET)) {
      try {
        const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_APP_SECRET;
        const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: process.env.SHOPIFY_CLIENT_ID.trim(),
            client_secret: clientSecret?.trim(),
            grant_type: "client_credentials",
          }),
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData?.access_token) {
            adminToken = tokenData.access_token;
          }
        }
      } catch (authErr) {
        console.warn("[Shopify Auto-Auth Note]:", authErr);
      }
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    let orderId = `NMR-2026-${randomSuffix}`;
    let shopifyOrderCreated = false;
    let shopifyOrderId: number | string | null = null;
    let shopifyOrderName: string | null = null;

    // ── Attempt Shopify Admin Order API Creation ──
    if (domain && adminToken) {
      try {
        const isPaid = payload.paymentMethod !== "cod";
        const financialStatus = isPaid ? "paid" : "pending";

        const paymentGatewayName =
          payload.paymentMethod === "cod"
            ? "Cash on Delivery (COD)"
            : payload.razorpayPaymentId
              ? `Razorpay Net Banking / Online (Ref: ${payload.razorpayPaymentId})`
              : "Razorpay Net Banking & UPI";

        const rawPhone = payload.customer.phone.replace(/\D/g, "");
        const formattedPhone = rawPhone.length >= 10 ? `+91${rawPhone.slice(-10)}` : rawPhone;

        const shopifyPayload = {
          order: {
            email: payload.customer.email.trim(),
            phone: formattedPhone,
            financial_status: financialStatus,
            fulfillment_status: null,
            send_receipt: true,
            send_fulfillment_receipt: true,
            note: `NatureMist Ritual Checkout · Payment: ${paymentGatewayName}${
              payload.razorpayPaymentId ? ` · Razorpay ID: ${payload.razorpayPaymentId}` : ""
            }`,
            tags: `NatureMist, In-App-Checkout, ${payload.paymentMethod.toUpperCase()}${
              payload.razorpayPaymentId ? `, RZP_${payload.razorpayPaymentId}` : ""
            }`,
            customer: {
              first_name: payload.customer.firstName.trim(),
              last_name: payload.customer.lastName.trim(),
              email: payload.customer.email.trim(),
              phone: formattedPhone,
            },
            billing_address: {
              first_name: payload.deliveryAddress.firstName.trim(),
              last_name: payload.deliveryAddress.lastName.trim(),
              address1: payload.deliveryAddress.address1.trim(),
              address2: payload.deliveryAddress.address2?.trim() || "",
              city: payload.deliveryAddress.city.trim(),
              province: payload.deliveryAddress.province.trim(),
              country: "India",
              zip: payload.deliveryAddress.zip.trim(),
              phone: formattedPhone,
            },
            shipping_address: {
              first_name: payload.deliveryAddress.firstName.trim(),
              last_name: payload.deliveryAddress.lastName.trim(),
              address1: payload.deliveryAddress.address1.trim(),
              address2: payload.deliveryAddress.address2?.trim() || "",
              city: payload.deliveryAddress.city.trim(),
              province: payload.deliveryAddress.province.trim(),
              country: "India",
              zip: payload.deliveryAddress.zip.trim(),
              phone: formattedPhone,
            },
            line_items: payload.items.map((item) => ({
              title: item.name,
              price: (item.pricePaise / item.quantity / 100).toFixed(2),
              quantity: item.quantity,
              variant_title: item.variant || "Default",
            })),
            shipping_lines: [
              {
                title:
                  payload.shippingMethod === "express"
                    ? "Express Priority Air Delivery (1-2 Days)"
                    : "Standard Ayurvedic Delivery (3-5 Days)",
                price: (payload.shippingFeePaise / 100).toFixed(2),
                code: payload.shippingMethod === "express" ? "Express" : "Standard",
              },
            ],
            payment_gateway_names: [paymentGatewayName],
          },
        };

        const res = await fetch(`https://${domain}/admin/api/2024-01/orders.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": adminToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shopifyPayload),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData?.order) {
            shopifyOrderCreated = true;
            shopifyOrderId = resData.order.id;
            shopifyOrderName = resData.order.name; // e.g. "#1001"
            orderId = resData.order.name || `NMR-${resData.order.order_number}`;
          }
        } else {
          const errData = await res.text();
          console.warn("[Shopify Orders API Note]:", res.status, errData);
        }
      } catch (adminErr) {
        console.warn("[Shopify Admin API Warning]:", adminErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      shopifyOrderCreated,
      shopifyOrderId,
      shopifyOrderName,
      placedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process order. Please try again.",
      },
      { status: 500 },
    );
  }
}
