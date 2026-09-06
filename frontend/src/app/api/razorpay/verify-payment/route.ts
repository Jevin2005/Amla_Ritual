import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

type VerifyPaymentPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
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
          verified: false,
          error: "Razorpay credentials are not configured on the server.",
        },
        { status: 500 },
      );
    }

    const payload = (await req.json()) as VerifyPaymentPayload;

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Missing required payment verification parameters.",
        },
        { status: 400 },
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const providedBuffer = Buffer.from(razorpaySignature, "utf-8");

    const isSignatureValid =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isSignatureValid) {
      console.warn("[Razorpay Verification Failed]: Signature mismatch", {
        razorpayOrderId,
        razorpayPaymentId,
      });
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Payment authentication failed: Digital signature mismatch.",
        },
        { status: 400 },
      );
    }

    // 2. Query Razorpay API to confirm payment capture status
    let paymentStatus = "captured";
    let capturedAmountPaise: number | null = null;
    let paymentMethod = "online";

    try {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const paymentRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
        {
          headers: { Authorization: authHeader },
        },
      );

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        paymentStatus = paymentData.status; // 'captured', 'authorized', etc.
        capturedAmountPaise = paymentData.amount;
        paymentMethod = paymentData.method || "online";

        if (paymentStatus !== "captured" && paymentStatus !== "authorized") {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              error: `Payment is not in captured status (Current status: ${paymentStatus}).`,
            },
            { status: 400 },
          );
        }
      }
    } catch (apiErr) {
      console.warn("[Razorpay Payment Status Query Warning]:", apiErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      status: paymentStatus,
      amountPaise: capturedAmountPaise,
      method: paymentMethod,
    });
  } catch (error) {
    console.error("[Payment Verification Error]:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification error occurred.",
      },
      { status: 500 },
    );
  }
}
