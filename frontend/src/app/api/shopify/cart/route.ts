import { type NextRequest, NextResponse } from "next/server";
import { shopifyStorefrontRequest } from "@/lib/shopify/storefront";

const CART_COOKIE = "naturemist_shopify_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
const MAX_LINES_PER_REQUEST = 100;
const MAX_QUANTITY = 250;
const MAX_CART_BODY_BYTES = 64 * 1024;

async function readLimitedJson(request: Request, maximumBytes: number) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maximumBytes) throw new Error("PAYLOAD_TOO_LARGE");

  const reader = request.body?.getReader();
  if (!reader) return null;
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
  return JSON.parse(new TextDecoder().decode(payload)) as unknown;
}

const MONEY_FIELDS = `
  amount
  currencyCode
`;

const CART_LINE_FIELDS = `
  id
  quantity
  cost {
    amountPerQuantity { ${MONEY_FIELDS} }
    compareAtAmountPerQuantity { ${MONEY_FIELDS} }
    subtotalAmount { ${MONEY_FIELDS} }
    totalAmount { ${MONEY_FIELDS} }
  }
  discountAllocations(lineLevelOnly: false) {
    discountedAmount { ${MONEY_FIELDS} }
  }
  merchandise {
    ... on ProductVariant {
      id
      title
      availableForSale
      quantityAvailable
      selectedOptions { name value }
      image { url altText width height }
      product {
        id
        handle
        title
        featuredImage { url altText width height }
      }
    }
  }
`;

const CART_FRAGMENT = `#graphql
  fragment NatureMistCartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    discountCodes {
      code
      applicable
    }
    cost {
      subtotalAmount { ${MONEY_FIELDS} }
      subtotalAmountEstimated
      totalAmount { ${MONEY_FIELDS} }
      totalAmountEstimated
    }
    lines(first: 250) {
      nodes { ${CART_LINE_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const CART_QUERY = `#graphql
  query NatureMistCart($cartId: ID!) {
    cart(id: $cartId) { ...NatureMistCartFields }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_PAGE_QUERY = `#graphql
  query NatureMistCartLinesPage($cartId: ID!, $after: String!) {
    cart(id: $cartId) {
      lines(first: 250, after: $after) {
        nodes { ${CART_LINE_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation NatureMistCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...NatureMistCartFields }
      userErrors { field message code }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation NatureMistCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...NatureMistCartFields }
      userErrors { field message code }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation NatureMistCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...NatureMistCartFields }
      userErrors { field message code }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation NatureMistCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...NatureMistCartFields }
      userErrors { field message code }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `#graphql
  mutation NatureMistCartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ...NatureMistCartFields }
      userErrors { field message code }
      warnings { code message target }
    }
  }
  ${CART_FRAGMENT}
`;

type Money = {
  amount: string;
  currencyCode: string;
};

type GraphImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type GraphCartLine = {
  id: string;
  quantity: number;
  cost: {
    amountPerQuantity: Money;
    compareAtAmountPerQuantity: Money | null;
    subtotalAmount: Money;
    totalAmount: Money;
  };
  discountAllocations: Array<{ discountedAmount: Money }>;
  merchandise: {
    id?: string;
    title?: string;
    availableForSale?: boolean;
    quantityAvailable?: number | null;
    selectedOptions?: Array<{ name: string; value: string }>;
    image?: GraphImage | null;
    product?: {
      id: string;
      handle: string;
      title: string;
      featuredImage: GraphImage | null;
    };
  };
};

type GraphCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  cost: {
    subtotalAmount: Money;
    subtotalAmountEstimated: boolean;
    totalAmount: Money;
    totalAmountEstimated: boolean;
  };
  lines: {
    nodes: GraphCartLine[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

type CartUserError = {
  field: string[] | null;
  message: string;
  code?: string | null;
};

type CartWarning = {
  code?: string | null;
  message: string;
  target?: string | null;
};

type GraphCartPayload = {
  cart: GraphCart | null;
  userErrors: CartUserError[];
  warnings?: CartWarning[];
};

type CartQueryResponse = { cart: GraphCart | null };
type CartLinesPageResponse = {
  cart: { lines: GraphCart["lines"] } | null;
};
type CartCreateResponse = { cartCreate: GraphCartPayload };
type CartLinesAddResponse = { cartLinesAdd: GraphCartPayload };
type CartLinesUpdateResponse = { cartLinesUpdate: GraphCartPayload };
type CartLinesRemoveResponse = { cartLinesRemove: GraphCartPayload };
type CartDiscountResponse = { cartDiscountCodesUpdate: GraphCartPayload };

type CartLineInput = { merchandiseId: string; quantity: number };
type CartLineUpdate = { id: string; quantity: number };

function toPaise(money: Money | null | undefined) {
  const amount = Number(money?.amount);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function toImage(image: GraphImage | null | undefined) {
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText?.trim() || "",
    width: image.width || 1200,
    height: image.height || 1200,
  };
}

async function completeCartLines(cart: GraphCart, ip: string | null) {
  const lines = [...cart.lines.nodes];
  let pageInfo = cart.lines.pageInfo;

  while (pageInfo.hasNextPage) {
    if (!pageInfo.endCursor) {
      throw new Error("Shopify returned a non-advancing cart cursor.");
    }
    const data = await shopifyStorefrontRequest<CartLinesPageResponse>(
      CART_LINES_PAGE_QUERY,
      { cartId: cart.id, after: pageInfo.endCursor },
      { buyerIp: ip },
    );
    if (!data.cart) throw new Error("The Shopify cart expired while it was loading.");

    lines.push(...data.cart.lines.nodes);
    const nextPageInfo = data.cart.lines.pageInfo;
    if (
      nextPageInfo.hasNextPage &&
      (!nextPageInfo.endCursor || nextPageInfo.endCursor === pageInfo.endCursor)
    ) {
      throw new Error("Shopify returned a non-advancing cart cursor.");
    }
    pageInfo = nextPageInfo;
  }

  return { ...cart, lines: { nodes: lines, pageInfo } };
}

function normalizeCart(cart: GraphCart) {
  const items = cart.lines.nodes.flatMap((line) => {
    const variant = line.merchandise;
    const product = variant.product;
    if (!variant.id || !product?.handle) return [];

    const discountAmountPaise = line.discountAllocations.reduce(
      (total, allocation) => total + toPaise(allocation.discountedAmount),
      0,
    );

    return [
      {
        lineId: line.id,
        slug: product.handle,
        productId: product.id,
        productName: product.title,
        variantId: variant.id,
        variantTitle: variant.title || "Default Title",
        selectedOptions: variant.selectedOptions || [],
        quantity: line.quantity,
        availableForSale: Boolean(variant.availableForSale),
        quantityAvailable: variant.quantityAvailable ?? null,
        pricePaise: toPaise(line.cost.amountPerQuantity),
        compareAtPricePaise: line.cost.compareAtAmountPerQuantity
          ? toPaise(line.cost.compareAtAmountPerQuantity)
          : null,
        lineSubtotalPaise: toPaise(line.cost.subtotalAmount),
        lineTotalPaise: toPaise(line.cost.totalAmount),
        discountAmountPaise,
        currencyCode: line.cost.totalAmount.currencyCode,
        image: toImage(variant.image || product.featuredImage),
      },
    ];
  });

  return {
    checkoutUrl: cart.checkoutUrl,
    items,
    totalQuantity: cart.totalQuantity,
    subtotalPaise: toPaise(cart.cost.subtotalAmount),
    totalPaise: toPaise(cart.cost.totalAmount),
    discountAmountPaise: items.reduce(
      (total, item) => total + item.discountAmountPaise,
      0,
    ),
    currencyCode: cart.cost.totalAmount.currencyCode,
    subtotalEstimated: cart.cost.subtotalAmountEstimated,
    totalEstimated: cart.cost.totalAmountEstimated,
    discountCodes: cart.discountCodes.map((discount) => ({
      code: discount.code,
      applicable: discount.applicable,
    })),
  };
}

function redactSecrets(value: string) {
  return value.replace(
    /gid:\/\/shopify\/Cart\/[^\s"']+/gi,
    "[redacted Shopify cart]",
  );
}

function normalizeIssues<T extends CartUserError | CartWarning>(issues: T[] = []) {
  return issues.map((issue) => ({
    code: issue.code || null,
    message: redactSecrets(issue.message),
  }));
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function setCartCookie(response: NextResponse, cartId: string) {
  response.cookies.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
    priority: "high",
  });
  return response;
}

function clearCartCookie(response: NextResponse) {
  response.cookies.set(CART_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    priority: "high",
  });
  return response;
}

function validIpv4(value: string) {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  );
}

function buyerIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const candidate = (
    request.headers.get("cf-connecting-ip") ||
    forwarded ||
    request.headers.get("x-real-ip") ||
    ""
  ).trim();
  if (validIpv4(candidate)) return candidate;
  if (
    candidate.length <= 45 &&
    candidate.includes(":") &&
    /^[0-9a-f:.]+$/i.test(candidate)
  ) {
    return candidate;
  }
  return null;
}

function readQuantity(value: unknown, allowZero = false) {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  const minimum = allowZero ? 0 : 1;
  return value >= minimum && value <= MAX_QUANTITY ? value : null;
}

function readCartLines(value: unknown): CartLineInput[] | null {
  if (!Array.isArray(value) || value.length > MAX_LINES_PER_REQUEST) return null;
  const lines: CartLineInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const merchandiseId = (entry as { merchandiseId?: unknown }).merchandiseId;
    const quantity = readQuantity((entry as { quantity?: unknown }).quantity);
    if (
      typeof merchandiseId !== "string" ||
      !merchandiseId.startsWith("gid://shopify/ProductVariant/") ||
      merchandiseId.length > 256 ||
      quantity === null
    ) {
      return null;
    }
    lines.push({ merchandiseId, quantity });
  }
  return lines;
}

function readLineUpdates(value: unknown): CartLineUpdate[] | null {
  if (!Array.isArray(value) || !value.length || value.length > MAX_LINES_PER_REQUEST) {
    return null;
  }
  const lines: CartLineUpdate[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const id = (entry as { id?: unknown }).id;
    const quantity = readQuantity((entry as { quantity?: unknown }).quantity, true);
    if (
      typeof id !== "string" ||
      !id.startsWith("gid://shopify/") ||
      id.length > 512 ||
      quantity === null
    ) {
      return null;
    }
    lines.push({ id, quantity });
  }
  return lines;
}

function readLineIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.length || value.length > MAX_LINES_PER_REQUEST) {
    return null;
  }
  const lineIds = value.filter(
    (id): id is string =>
      typeof id === "string" &&
      id.startsWith("gid://shopify/") &&
      id.length <= 512,
  );
  return lineIds.length === value.length ? [...new Set(lineIds)] : null;
}

function readDiscountCodes(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const codes = value
    .map((code) => (typeof code === "string" ? code.trim() : ""))
    .filter(Boolean);
  if (codes.length !== value.length || codes.some((code) => code.length > 255)) {
    return null;
  }
  const seen = new Set<string>();
  return codes.filter((code) => {
    const key = code.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function payloadResponse(payload: GraphCartPayload, ip: string | null) {
  const userErrors = normalizeIssues(payload.userErrors);
  const warnings = normalizeIssues(payload.warnings || []);
  if (!payload.cart) {
    return json(
      {
        error: userErrors[0]?.message || "Shopify could not update this bag.",
        userErrors,
        warnings,
      },
      422,
    );
  }

  const completeCart = await completeCartLines(payload.cart, ip);
  const response = json({
    cart: normalizeCart(completeCart),
    userErrors,
    warnings,
  });
  return setCartCookie(response, completeCart.id);
}

async function createCart(
  lines: CartLineInput[],
  discountCodes: string[],
  ip: string | null,
) {
  const countryCode =
    process.env.SHOPIFY_DEFAULT_COUNTRY?.trim().toUpperCase() || "IN";
  const data = await shopifyStorefrontRequest<CartCreateResponse>(
    CART_CREATE_MUTATION,
    {
      input: {
        lines,
        discountCodes,
        buyerIdentity: { countryCode },
      },
    },
    { buyerIp: ip },
  );
  return data.cartCreate;
}

export async function GET(request: NextRequest) {
  const cartId = request.cookies.get(CART_COOKIE)?.value;
  if (!cartId) return json({ cart: null, userErrors: [], warnings: [] });

  try {
    const data = await shopifyStorefrontRequest<CartQueryResponse>(
      CART_QUERY,
      { cartId },
      { buyerIp: buyerIp(request) },
    );
    if (!data.cart) {
      return clearCartCookie(
        json({ cart: null, userErrors: [], warnings: [] }),
      );
    }
    const completeCart = await completeCartLines(data.cart, buyerIp(request));
    return setCartCookie(
      json({ cart: normalizeCart(completeCart), userErrors: [], warnings: [] }),
      completeCart.id,
    );
  } catch {
    return json(
      { error: "Your Shopify bag could not be restored. Please try again." },
      502,
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed = await readLimitedJson(request, MAX_CART_BODY_BYTES);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "A valid cart action is required." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return json({ error: "The cart request is too large." }, 413);
    }
    return json({ error: "A valid JSON request is required." }, 400);
  }

  const action = body.action;
  const cartId = request.cookies.get(CART_COOKIE)?.value || null;
  const ip = buyerIp(request);

  try {
    if (action === "create") {
      const lines = readCartLines(body.lines);
      const discountCodes = readDiscountCodes(body.discountCodes ?? []);
      if (!lines || !discountCodes) {
        return json({ error: "The cart lines or discount codes are invalid." }, 400);
      }
      return payloadResponse(await createCart(lines, discountCodes, ip), ip);
    }

    if (action === "add") {
      const lines = readCartLines(body.lines);
      if (!lines?.length) {
        return json({ error: "At least one valid merchandise line is required." }, 400);
      }
      if (!cartId) return payloadResponse(await createCart(lines, [], ip), ip);

      const data = await shopifyStorefrontRequest<CartLinesAddResponse>(
        CART_LINES_ADD_MUTATION,
        { cartId, lines },
        { buyerIp: ip },
      );
      if (!data.cartLinesAdd.cart) {
        // Carts can expire between page hydration and an add. Starting a fresh cart
        // is safe here because no existing checkout state can still be recovered.
        return payloadResponse(await createCart(lines, [], ip), ip);
      }
      return payloadResponse(data.cartLinesAdd, ip);
    }

    if (!cartId) {
      return clearCartCookie(
        json(
          {
            error: "Your Shopify bag has expired. Add the item again to start a new bag.",
            code: "CART_EXPIRED",
          },
          409,
        ),
      );
    }

    if (action === "update") {
      const lines = readLineUpdates(body.lines);
      if (!lines) return json({ error: "The cart line update is invalid." }, 400);
      const data = await shopifyStorefrontRequest<CartLinesUpdateResponse>(
        CART_LINES_UPDATE_MUTATION,
        { cartId, lines },
        { buyerIp: ip },
      );
      return payloadResponse(data.cartLinesUpdate, ip);
    }

    if (action === "remove") {
      const lineIds = readLineIds(body.lineIds);
      if (!lineIds) return json({ error: "The cart line removal is invalid." }, 400);
      const data = await shopifyStorefrontRequest<CartLinesRemoveResponse>(
        CART_LINES_REMOVE_MUTATION,
        { cartId, lineIds },
        { buyerIp: ip },
      );
      return payloadResponse(data.cartLinesRemove, ip);
    }

    if (action === "discount") {
      const discountCodes = readDiscountCodes(body.discountCodes);
      if (!discountCodes) return json({ error: "The discount codes are invalid." }, 400);
      const data = await shopifyStorefrontRequest<CartDiscountResponse>(
        CART_DISCOUNT_CODES_UPDATE_MUTATION,
        { cartId, discountCodes },
        { buyerIp: ip },
      );
      return payloadResponse(data.cartDiscountCodesUpdate, ip);
    }

    return json({ error: "This cart action is not supported." }, 400);
  } catch {
    return json(
      { error: "Shopify could not update your bag. Please try again." },
      502,
    );
  }
}
