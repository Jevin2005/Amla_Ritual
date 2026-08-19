import { revalidateTag } from "next/cache";

const MAX_WEBHOOK_BYTES = 2 * 1024 * 1024;

async function readLimitedBody(request: Request, maximumBytes: number) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maximumBytes) throw new Error("PAYLOAD_TOO_LARGE");

  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maximumBytes) {
      await reader.cancel();
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    chunks.push(value);
  }

  const payload = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    payload.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return payload;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

function decodeBase64(value: string) {
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-shopify-hmac-sha256");
  if (!secret || !signature) {
    return Response.json({ error: "Webhook authentication is not configured." }, { status: 401 });
  }

  let payload: Uint8Array;
  try {
    payload = await readLimitedBody(request, MAX_WEBHOOK_BYTES);
  } catch {
    return Response.json({ error: "Webhook payload is too large." }, { status: 413 });
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedPayload = new Uint8Array(payload.byteLength);
  signedPayload.set(payload);
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, signedPayload.buffer),
  );

  if (!constantTimeEqual(digest, decodeBase64(signature))) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  revalidateTag("shopify-storefront", { expire: 0 });
  return Response.json({ received: true });
}
