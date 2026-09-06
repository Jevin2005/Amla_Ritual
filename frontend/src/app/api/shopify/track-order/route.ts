import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type TrackOrderPayload = {
  reference: string;
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as TrackOrderPayload;
    const rawRef = payload.reference?.trim() || "";

    if (!rawRef) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid order reference, order number, or phone number.",
        },
        { status: 400 },
      );
    }

    const domain =
      process.env.SHOPIFY_STORE_DOMAIN || "amla-ritual.myshopify.com";

    const adminToken =
      process.env.SHOPIFY_ADMIN_API_TOKEN ||
      (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.startsWith("shpat_")
        ? process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN
        : null);

    if (!domain || !adminToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Order tracking service is not configured on the server.",
        },
        { status: 500 },
      );
    }

    // ── 1. Normalize Query ──
    const digitsOnly = rawRef.replace(/\D/g, "");
    let candidateName = rawRef;

    // If user enters pure numbers like "1004" or "NMR-1004", normalize to "#1004"
    if (/^\d{3,6}$/.test(rawRef)) {
      candidateName = `#${rawRef}`;
    } else if (rawRef.toLowerCase().startsWith("nmr-")) {
      const suffix = rawRef.slice(4);
      if (/^\d+$/.test(suffix)) {
        candidateName = `#${suffix}`;
      }
    }

    // ── 2. Search Shopify Admin for Matching Order ──
    let matchedOrder: Record<string, unknown> | null = null;

    // Search attempt A: By exact order name (e.g. "#1004")
    try {
      const nameRes = await fetch(
        `https://${domain}/admin/api/2024-01/orders.json?name=${encodeURIComponent(candidateName)}&status=any`,
        {
          headers: {
            "X-Shopify-Access-Token": adminToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (nameRes.ok) {
        const nameData = await nameRes.json();
        if (nameData?.orders?.length > 0) {
          matchedOrder = nameData.orders[0];
        }
      }
    } catch (nameErr) {
      console.warn("[Track Order Name Lookup Warning]:", nameErr);
    }

    // Search attempt B: By recent orders matching phone or email or order note
    if (!matchedOrder) {
      try {
        const recentRes = await fetch(
          `https://${domain}/admin/api/2024-01/orders.json?status=any&limit=25`,
          {
            headers: {
              "X-Shopify-Access-Token": adminToken,
              "Content-Type": "application/json",
            },
          },
        );

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          const orders = (recentData?.orders || []) as Array<Record<string, unknown>>;

          matchedOrder =
            orders.find((o) => {
              const name = String(o.name || "").toLowerCase();
              const note = String(o.note || "").toLowerCase();
              const email = String(o.email || "").toLowerCase();
              const phone = String(o.phone || "").replace(/\D/g, "");
              const shippingPhone = String(
                (o.shipping_address as { phone?: string })?.phone || "",
              ).replace(/\D/g, "");

              const queryLower = rawRef.toLowerCase();

              return (
                name === queryLower ||
                name === `#${queryLower}` ||
                (digitsOnly.length >= 10 &&
                  (phone.includes(digitsOnly) ||
                    shippingPhone.includes(digitsOnly))) ||
                (queryLower.includes("@") && email === queryLower) ||
                (queryLower.length > 5 && note.includes(queryLower))
              );
            }) || null;
        }
      } catch (listErr) {
        console.warn("[Track Order List Lookup Warning]:", listErr);
      }
    }

    // ── 3. Return Not Found if No Match ──
    if (!matchedOrder) {
      return NextResponse.json({
        success: true,
        found: false,
        message: `No active order found for reference "${rawRef}". Please verify the order number (e.g. #1004) from your order confirmation or receipt.`,
      });
    }

    // ── 4. Format Structured Tracking Milestone Data ──
    type ShopifyFulfillment = {
      tracking_company?: string;
      tracking_number?: string;
      tracking_url?: string;
      status?: string;
      updated_at?: string;
    };

    const fulfillments =
      ((matchedOrder.fulfillments as ShopifyFulfillment[]) || []);
    const latestFulfillment = fulfillments[fulfillments.length - 1] || null;

    const isFulfilled =
      matchedOrder.fulfillment_status === "fulfilled" || Boolean(latestFulfillment);
    const isCancelled = Boolean(matchedOrder.cancelled_at);

    const shippingAddress =
      (matchedOrder.shipping_address as {
        city?: string;
        province?: string;
        zip?: string;
      }) || {};

    const items = ((matchedOrder.line_items as Array<{
      title: string;
      quantity: number;
      price: string;
    }>) || []).map((i) => ({
      name: i.title,
      quantity: i.quantity,
      price: i.price,
    }));

    const rawCreatedAt = String(matchedOrder.created_at || "");
    const formattedDate = rawCreatedAt
      ? new Date(rawCreatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recently placed";

    const milestones = [
      {
        id: "confirmed",
        title: "Order Confirmed & Logged",
        description: "Your botanical order is recorded and verified in Shopify.",
        status: "completed",
        date: formattedDate,
      },
      {
        id: "preparing",
        title: "Fresh Packing in UV Glass Jars",
        description: "Wildcrafted botanical powder is measured and seal-inspected.",
        status: isFulfilled ? "completed" : "in_progress",
        date: isFulfilled ? formattedDate : "Today",
      },
      {
        id: "dispatched",
        title: isFulfilled ? "Dispatched with Priority Air Courier" : "Ready for Courier Handover",
        description: latestFulfillment?.tracking_number
          ? `Waybill: ${latestFulfillment.tracking_number} via ${latestFulfillment.tracking_company || "Express Air"}`
          : "Handing over to courier partner within 12–24 business hours.",
        status: isFulfilled ? "completed" : "pending",
        date: latestFulfillment?.updated_at
          ? new Date(latestFulfillment.updated_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })
          : "Upcoming",
      },
      {
        id: "delivered",
        title: "Doorstep Delivery",
        description: `Delivering to ${shippingAddress.city || "your city"}, ${shippingAddress.province || "India"} - ${shippingAddress.zip || ""}`,
        status:
          latestFulfillment?.status === "delivered" ? "completed" : "pending",
        date: "3–5 Business Days",
      },
    ];

    const resolveCarrierTrackingUrl = (
      company?: string | null,
      trackingNumber?: string | null,
      explicitUrl?: string | null,
    ): string | null => {
      if (explicitUrl && explicitUrl.trim().startsWith("http")) return explicitUrl.trim();
      if (!trackingNumber) return null;

      const num = trackingNumber.trim();
      const comp = (company || "").toLowerCase();

      if (comp.includes("delhivery")) {
        return `https://www.delhivery.com/track/package/${num}`;
      }
      if (comp.includes("bluedart") || comp.includes("blue dart")) {
        return `https://www.bluedart.com/tracking?trackNumber=${num}`;
      }
      if (comp.includes("dtdc")) {
        return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strContCode=${num}`;
      }
      if (comp.includes("india post") || comp.includes("speed post") || comp.includes("indiapost")) {
        return `https://www.indiapost.gov.in/_layouts/15/dpt.ptc.tracktrace/trackprocess.aspx`;
      }
      if (comp.includes("shiprocket")) {
        return `https://shiprocket.co/tracking/${num}`;
      }
      if (comp.includes("ekart")) {
        return `https://ekartlogistics.com/shipmenttrack/${num}`;
      }
      if (comp.includes("xpressbees")) {
        return `https://www.xpressbees.com/shipment/tracking?awb=${num}`;
      }
      if (comp.includes("shadowfax")) {
        return `https://tracker.shadowfax.in/#/track/${num}`;
      }
      return `https://www.google.com/search?q=${encodeURIComponent(`${company || "Courier"} tracking ${num}`)}`;
    };

    const resolvedTrackingUrl = resolveCarrierTrackingUrl(
      latestFulfillment?.tracking_company,
      latestFulfillment?.tracking_number,
      latestFulfillment?.tracking_url,
    );

    return NextResponse.json({
      success: true,
      found: true,
      order: {
        orderName: matchedOrder.name,
        placedAt: formattedDate,
        financialStatus: matchedOrder.financial_status,
        fulfillmentStatus: matchedOrder.fulfillment_status || "Processing",
        isCancelled,
        destination: `${shippingAddress.city || ""}, ${shippingAddress.province || ""}`.trim() || "India",
        pinCode: shippingAddress.zip || "",
        items,
        totalPrice: matchedOrder.total_price,
        currency: matchedOrder.currency || "INR",
        carrier: latestFulfillment?.tracking_company || null,
        trackingNumber: latestFulfillment?.tracking_number || null,
        trackingUrl: resolvedTrackingUrl,
        milestones,
      },
    });
  } catch (error) {
    console.error("[Track Order API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to look up order tracking details.",
      },
      { status: 500 },
    );
  }
}
