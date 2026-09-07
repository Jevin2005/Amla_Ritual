import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
    sku?: string;
  }>;
  paymentMethod: "cod" | "upi" | "shopify";
  shippingMethod: "standard" | "express";
  shippingFeePaise: number;
  totalPaise: number;
  currencyCode?: string;
  discountCode?: string;
  newsletter?: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  upiId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as OrderRequestPayload;

    if (
      !payload.customer?.email ||
      !payload.customer?.phone ||
      !payload.items?.length
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required order details." },
        { status: 400 },
      );
    }

    // ── 1. Strict Payment Security: Verify Razorpay for Cards/NetBanking & UPI ──
    const isRazorpayPayment =
      payload.paymentMethod === "shopify" ||
      (payload.paymentMethod === "upi" && Boolean(payload.razorpayPaymentId));

    if (isRazorpayPayment) {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = payload;
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Payment verification failed: Missing required Razorpay transaction proof.",
          },
          { status: 400 },
        );
      }

      if (!keySecret) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment gateway secret is not configured on the server.",
          },
          { status: 500 },
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
      const providedBuffer = Buffer.from(razorpaySignature, "utf-8");

      const isSignatureValid =
        expectedBuffer.length === providedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, providedBuffer);

      if (!isSignatureValid) {
        console.warn("[Security Alert]: Fraudulent order attempt rejected. Signature mismatch.", {
          razorpayOrderId,
          razorpayPaymentId,
        });
        return NextResponse.json(
          {
            success: false,
            error:
              "Payment authentication rejected: Digital signature verification failed.",
          },
          { status: 403 },
        );
      }
    }

    const domain =
      process.env.SHOPIFY_STORE_DOMAIN || "amla-ritual.myshopify.com";

    // ── 2. Admin Token Resolution ──
    // Priority 1: Explicit SHOPIFY_ADMIN_API_TOKEN
    // Priority 2: SHOPIFY_STOREFRONT_PRIVATE_TOKEN if it is an Admin/Custom app token (starts with shpat_)
    let adminToken =
      process.env.SHOPIFY_ADMIN_API_TOKEN ||
      (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.startsWith("shpat_")
        ? process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN
        : null);

    // Priority 3: Auto-Auth via Client ID & Secret
    if (
      !adminToken &&
      process.env.SHOPIFY_CLIENT_ID &&
      (process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_APP_SECRET)
    ) {
      try {
        const clientSecret =
          process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_APP_SECRET;
        const tokenRes = await fetch(
          `https://${domain}/admin/oauth/access_token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: process.env.SHOPIFY_CLIENT_ID.trim(),
              client_secret: clientSecret?.trim(),
              grant_type: "client_credentials",
            }),
          },
        );
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData?.access_token) {
            adminToken = tokenData.access_token;
          }
        }
      } catch (authErr) {
        console.warn("[Shopify Auto-Auth Warning]:", authErr);
      }
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    let orderId = `NMR-2026-${randomSuffix}`;
    let shopifyOrderCreated = false;
    let shopifyOrderId: number | string | null = null;
    let shopifyOrderName: string | null = null;
    let shopifyOrderError: string | null = null;

    // ── 3. Create Order & Customer in Shopify Admin ──
    if (domain && adminToken) {
      try {
        const financialStatus = isRazorpayPayment ? "paid" : "pending";

        const paymentGatewayName =
          payload.paymentMethod === "cod"
            ? "Cash on Delivery (COD)"
            : payload.paymentMethod === "upi"
              ? payload.razorpayPaymentId
                ? `Razorpay Instant UPI (ID: ${payload.razorpayPaymentId})`
                : `Instant UPI Transfer (Ref/UTR: ${payload.upiId || "Submitted"})`
              : payload.razorpayPaymentId
                ? `Razorpay Net Banking / Cards (ID: ${payload.razorpayPaymentId})`
                : "Razorpay Online";

        const rawPhone = payload.customer.phone.replace(/\D/g, "");
        const formattedPhone =
          rawPhone.length >= 10 ? `+91${rawPhone.slice(-10)}` : rawPhone;

        const shopifyPayload = {
          order: {
            email: payload.customer.email.trim(),
            phone: formattedPhone,
            financial_status: financialStatus,
            fulfillment_status: null,
            send_receipt: true,
            send_fulfillment_receipt: true,
            note: `NatureMist Ritual Order · Payment: ${paymentGatewayName}${
              payload.upiId
                ? ` · UPI Ref/UTR: ${payload.upiId.trim()}`
                : ""
            }${
              payload.razorpayPaymentId
                ? ` · Razorpay Payment: ${payload.razorpayPaymentId}`
                : ""
            }${
              payload.razorpayOrderId
                ? ` · Razorpay Order: ${payload.razorpayOrderId}`
                : ""
            }${
              payload.deliveryAddress.address2
                ? ` · Landmark/Apt: ${payload.deliveryAddress.address2.trim()}`
                : ""
            }`,
            tags: `NatureMist, In-App-Checkout, ${payload.paymentMethod.toUpperCase()}${
              payload.paymentMethod === "upi" ? ", UPI, INSTANT_UPI" : ""
            }${
              payload.razorpayPaymentId
                ? `, RZP_${payload.razorpayPaymentId}`
                : ""
            }`,
            customer: {
              first_name: payload.customer.firstName.trim(),
              last_name: payload.customer.lastName.trim(),
              email: payload.customer.email.trim(),
              phone: formattedPhone,
              verified_email: true,
              accepts_marketing: Boolean(payload.newsletter),
              tags: "NatureMist Customer, In-App-Checkout",
            },
            billing_address: {
              first_name: payload.deliveryAddress.firstName.trim(),
              last_name: payload.deliveryAddress.lastName.trim(),
              address1: payload.deliveryAddress.address1.trim(),
              address2: payload.deliveryAddress.address2?.trim() || "",
              city: payload.deliveryAddress.city.trim(),
              province: payload.deliveryAddress.province.trim(),
              country: "India",
              country_code: "IN",
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
              country_code: "IN",
              zip: payload.deliveryAddress.zip.trim(),
              phone: formattedPhone,
            },
            line_items: payload.items.map((item) => ({
              title: item.name,
              price: (item.pricePaise / item.quantity / 100).toFixed(2),
              quantity: item.quantity,
              variant_title: item.variant || "Default",
              sku: item.sku || undefined,
              properties: item.slug
                ? [{ name: "Botanical Handle", value: item.slug }]
                : [],
            })),
            shipping_lines: [
              {
                title:
                  payload.shippingMethod === "express"
                    ? "Express Priority Air Delivery (1-2 Days)"
                    : "Standard Ayurvedic Delivery (3-5 Days · Free)",
                price: (payload.shippingFeePaise / 100).toFixed(2),
                code:
                  payload.shippingMethod === "express" ? "Express" : "Standard",
              },
            ],
            payment_gateway_names: [paymentGatewayName],
          },
        };

        const res = await fetch(
          `https://${domain}/admin/api/2024-01/orders.json`,
          {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": adminToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(shopifyPayload),
          },
        );

        if (res.ok) {
          const resData = await res.json();
          if (resData?.order) {
            shopifyOrderCreated = true;
            shopifyOrderId = resData.order.id;
            shopifyOrderName = resData.order.name; // e.g. "#1001"
            orderId = resData.order.name || `NMR-${resData.order.order_number}`;
            console.log(
              `[Shopify Order Created Successfully]: Order ${shopifyOrderName} (ID: ${shopifyOrderId})`,
            );
          }
        } else {
          const errText = await res.text();
          // If customer phone or email already exists for another record, retry by associating at order level
          if (errText.includes("already been taken") || errText.includes("customer")) {
            const fallbackPayload = {
              order: {
                ...shopifyPayload.order,
                customer: undefined,
              },
            };
            const retryRes = await fetch(
              `https://${domain}/admin/api/2024-01/orders.json`,
              {
                method: "POST",
                headers: {
                  "X-Shopify-Access-Token": adminToken,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(fallbackPayload),
              },
            );

            if (retryRes.ok) {
              const retryData = await retryRes.json();
              if (retryData?.order) {
                shopifyOrderCreated = true;
                shopifyOrderId = retryData.order.id;
                shopifyOrderName = retryData.order.name;
                orderId = retryData.order.name || `NMR-${retryData.order.order_number}`;
                console.log(
                  `[Shopify Order Created with Existing Customer]: Order ${shopifyOrderName} (ID: ${shopifyOrderId})`,
                );
              }
            } else {
              shopifyOrderError = await retryRes.text();
              console.warn("[Shopify Order Retry Warning]:", retryRes.status, shopifyOrderError);
            }
          } else {
            shopifyOrderError = errText;
            console.warn(
              `[Shopify Orders API Warning]: Status ${res.status}. Details:`,
              errText,
            );
          }
        }
      } catch (adminErr) {
        console.warn("[Shopify Admin API Network Warning]:", adminErr);
        shopifyOrderError =
          adminErr instanceof Error ? adminErr.message : String(adminErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      shopifyOrderCreated,
      shopifyOrderId,
      shopifyOrderName,
      shopifyOrderError: shopifyOrderCreated ? null : shopifyOrderError,
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
