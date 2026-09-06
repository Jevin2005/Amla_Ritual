import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type CreateRazorpayOrderPayload = {
  amountPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  try {
    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay credentials are not configured on the server.",
        },
        { status: 500 },
      );
    }

    const payload = (await req.json()) as CreateRazorpayOrderPayload;
    const amountPaise = Math.round(Number(payload.amountPaise));

    // Razorpay requires minimum ₹1 (100 paise)
    if (!amountPaise || amountPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order amount. Minimum amount is ₹1.00.",
        },
        { status: 400 },
      );
    }

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

    const randomReceipt =
      payload.receipt ||
      `nm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: payload.currency || "INR",
        receipt: randomReceipt.slice(0, 40),
        notes: payload.notes || {},
      }),
    });

    const rzpData = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error("[Razorpay Order Creation Failed]:", rzpData);
      return NextResponse.json(
        {
          success: false,
          error:
            rzpData?.error?.description ||
            "Unable to create secure Razorpay payment order.",
        },
        { status: rzpResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      orderId: rzpData.id,
      amountPaise: rzpData.amount,
      currency: rzpData.currency,
      keyId,
    });
  } catch (error) {
    console.error("[Razorpay Order API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate payment. Please try again.",
      },
      { status: 500 },
    );
  }
}
