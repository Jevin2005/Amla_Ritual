"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getDefaultVariant,
  type Product,
  type ProductBundle,
  type ProductVariant,
  type StoreImage,
} from "@/domain/catalog/products";
import type { StorefrontContent } from "@/lib/shopify/storefront";

export type StorefrontSource = "shopify" | "preview";

export type CartItem = {
  lineId: string;
  slug: string;
  productId: string | null;
  productName: string;
  variantId: string | null;
  variantTitle: string;
  selectedOptions: Array<{ name: string; value: string }>;
  quantity: number;
  availableForSale: boolean;
  quantityAvailable: number | null;
  pricePaise: number;
  compareAtPricePaise: number | null;
  lineSubtotalPaise: number;
  lineTotalPaise: number;
  discountAmountPaise: number;
  currencyCode: string;
  image: StoreImage | null;
};

export type CartDiscountCode = {
  code: string;
  applicable: boolean;
};

export type StoreCart = {
  checkoutUrl: string | null;
  items: CartItem[];
  totalQuantity: number;
  subtotalPaise: number;
  totalPaise: number;
  discountAmountPaise: number;
  currencyCode: string;
  subtotalEstimated: boolean;
  totalEstimated: boolean;
  discountCodes: CartDiscountCode[];
};

export type CartNotice = {
  code: string | null;
  message: string;
};

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

type StoreContextValue = {
  products: Product[];
  bundles: ProductBundle[];
  content: StorefrontContent;
  source: StorefrontSource;
  cart: CartItem[];
  cartCount: number;
  subtotalPaise: number;
  totalPaise: number;
  discountAmountPaise: number;
  currencyCode: string;
  totalsEstimated: boolean;
  discountCodes: CartDiscountCode[];
  checkoutUrl: string | null;
  cartError: string;
  cartWarnings: CartNotice[];
  isCartBusy: boolean;
  wishlist: string[];
  isHydrated: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  announcement: string;
  addToCart: (
    slug: string,
    quantity?: number,
    openDrawer?: boolean,
    variantId?: string,
  ) => Promise<StoreCart | null>;
  addManyToCart: (slugs: readonly string[]) => Promise<StoreCart | null>;
  updateQuantity: (identifier: string, quantity: number) => Promise<void>;
  removeFromCart: (identifier: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<boolean>;
  removeDiscountCode: (code: string) => Promise<void>;
  clearCartError: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  track: (event: string, payload?: AnalyticsPayload) => void;
};

type StoreProviderProps = {
  children: ReactNode;
  initialProducts: Product[];
  initialBundles: ProductBundle[];
  content: StorefrontContent;
  source: StorefrontSource;
};

type CartApiPayload = {
  cart: StoreCart | null;
  userErrors?: CartNotice[];
  warnings?: CartNotice[];
};

type PreviewStoredItem = {
  slug: string;
  quantity: number;
  variantId?: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "naturemist-cart-v1";
const WISHLIST_KEY = "naturemist-wishlist-v1";
const MAX_CART_QUANTITY = 12;

function readStoredArray<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function normalizeQuantity(quantity: number, maximum = MAX_CART_QUANTITY) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(maximum, Math.floor(quantity)));
}

function productAvailability(product: Product, variant: ProductVariant | null) {
  return variant?.availableForSale ?? product.availableForSale ?? true;
}

function variantMaximum(variant: ProductVariant | null) {
  if (variant?.quantityAvailable === null || variant?.quantityAvailable === undefined) {
    return MAX_CART_QUANTITY;
  }
  return Math.max(0, Math.min(MAX_CART_QUANTITY, variant.quantityAvailable));
}

function selectVariant(product: Product, variantId?: string | null) {
  if (variantId) {
    return product.variants?.find((variant) => variant.id === variantId) ?? null;
  }
  return getDefaultVariant(product);
}

function previewLine(
  product: Product,
  quantity: number,
  variant: ProductVariant | null,
): CartItem {
  const pricePaise = variant?.pricePaise ?? product.pricePaise;
  const currencyCode = variant?.currencyCode || product.currencyCode || "INR";
  const variantKey = variant?.id || "default";
  return {
    lineId: `preview:${product.slug}:${variantKey}`,
    slug: product.slug,
    productId: product.id || null,
    productName: product.name,
    variantId: variant?.id || null,
    variantTitle: variant?.title || "Default Title",
    selectedOptions: variant?.selectedOptions || [],
    quantity,
    availableForSale: productAvailability(product, variant),
    quantityAvailable: variant?.quantityAvailable ?? null,
    pricePaise,
    compareAtPricePaise:
      variant?.compareAtPricePaise ?? product.compareAtPricePaise ?? null,
    lineSubtotalPaise: pricePaise * quantity,
    lineTotalPaise: pricePaise * quantity,
    discountAmountPaise: 0,
    currencyCode,
    image: variant?.image || product.featuredImage || null,
  };
}

function emptyCart(currencyCode = "INR"): StoreCart {
  return {
    checkoutUrl: null,
    items: [],
    totalQuantity: 0,
    subtotalPaise: 0,
    totalPaise: 0,
    discountAmountPaise: 0,
    currencyCode,
    subtotalEstimated: false,
    totalEstimated: false,
    discountCodes: [],
  };
}

function previewCart(items: CartItem[], fallbackCurrency = "INR"): StoreCart {
  const subtotalPaise = items.reduce(
    (total, item) => total + item.pricePaise * item.quantity,
    0,
  );
  return {
    checkoutUrl: null,
    items: items.map((item) => ({
      ...item,
      lineSubtotalPaise: item.pricePaise * item.quantity,
      lineTotalPaise: item.pricePaise * item.quantity,
      discountAmountPaise: 0,
    })),
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    subtotalPaise,
    totalPaise: subtotalPaise,
    discountAmountPaise: 0,
    currencyCode: items[0]?.currencyCode || fallbackCurrency,
    subtotalEstimated: false,
    totalEstimated: false,
    discountCodes: [],
  };
}

function restorePreviewCart(catalog: Product[]) {
  const productsBySlug = new Map(catalog.map((product) => [product.slug, product]));
  const linesByKey = new Map<string, CartItem>();

  for (const value of readStoredArray<unknown>(CART_KEY)) {
    if (!value || typeof value !== "object") continue;
    const item = value as Partial<PreviewStoredItem>;
    if (
      typeof item.slug !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      continue;
    }
    const product = productsBySlug.get(item.slug);
    if (!product) continue;
    const requestedVariantId =
      typeof item.variantId === "string" ? item.variantId : null;
    const variant = selectVariant(product, requestedVariantId);
    if (requestedVariantId && !variant) continue;
    const maximum = variantMaximum(variant);
    if (maximum < 1) continue;
    const line = previewLine(
      product,
      normalizeQuantity(item.quantity, maximum),
      variant,
    );
    const existing = linesByKey.get(line.lineId);
    if (existing) {
      existing.quantity = Math.min(maximum, existing.quantity + line.quantity);
    } else {
      linesByKey.set(line.lineId, line);
    }
  }

  return previewCart(
    Array.from(linesByKey.values()),
    catalog[0]?.currencyCode || "INR",
  );
}

class CartApiError extends Error {
  code: string | null;

  constructor(message: string, code: string | null = null) {
    super(message);
    this.code = code;
  }
}

async function readApiPayload(response: Response): Promise<CartApiPayload> {
  let payload: (CartApiPayload & { error?: string; code?: string }) | null = null;
  try {
    payload = (await response.json()) as CartApiPayload & {
      error?: string;
      code?: string;
    };
  } catch {
    // A non-JSON upstream failure is surfaced through the stable message below.
  }
  if (!response.ok) {
    throw new CartApiError(
      payload?.error || "Your bag could not be updated. Please try again.",
      payload?.code || null,
    );
  }
  return payload || { cart: null, userErrors: [], warnings: [] };
}

async function fetchCart(signal?: AbortSignal) {
  const response = await fetch("/api/shopify/cart", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });
  return readApiPayload(response);
}

async function mutateCart(body: Record<string, unknown>) {
  const response = await fetch("/api/shopify/cart", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readApiPayload(response);
}

export function StoreProvider({
  children,
  initialProducts,
  initialBundles,
  content,
  source,
}: StoreProviderProps) {
  const fallbackCurrency = initialProducts[0]?.currencyCode || "INR";
  const [storeCart, setStoreCart] = useState<StoreCart>(() =>
    emptyCart(fallbackCurrency),
  );
  const cartRef = useRef(storeCart);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [cartError, setCartError] = useState("");
  const [cartWarnings, setCartWarnings] = useState<CartNotice[]>([]);
  const [isCartBusy, setIsCartBusy] = useState(false);
  const busyRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  const productsBySlug = useMemo(
    () => new Map(initialProducts.map((product) => [product.slug, product])),
    [initialProducts],
  );

  const commitCart = useCallback((cart: StoreCart) => {
    cartRef.current = cart;
    setStoreCart(cart);
  }, []);

  const clearCartError = useCallback(() => setCartError(""), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function hydrate() {
      const savedWishlist = readStoredArray<string>(WISHLIST_KEY).filter(
        (slug) => typeof slug === "string" && productsBySlug.has(slug),
      );
      if (active) setWishlist([...new Set(savedWishlist)]);

      if (source === "preview") {
        const restored = restorePreviewCart(initialProducts);
        if (active) commitCart(restored);
      } else {
        try {
          const payload = await fetchCart(controller.signal);
          if (!active) return;
          commitCart(payload.cart || emptyCart(fallbackCurrency));
          setCartWarnings(payload.warnings || []);
          if (payload.userErrors?.length) {
            setCartError(payload.userErrors[0].message);
          }
        } catch (error) {
          if (!active || controller.signal.aborted) return;
          setCartError(
            error instanceof Error
              ? error.message
              : "Your Shopify bag could not be restored.",
          );
        }
      }

      if (active) setHydrated(true);
    }

    void hydrate();
    return () => {
      active = false;
      controller.abort();
    };
  }, [commitCart, fallbackCurrency, initialProducts, productsBySlug, source]);

  useEffect(() => {
    if (!hydrated || source !== "preview") return;
    try {
      const stored: PreviewStoredItem[] = storeCart.items.map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
        variantId: item.variantId,
      }));
      window.localStorage.setItem(CART_KEY, JSON.stringify(stored));
    } catch {
      // Local preview storage is a progressive enhancement.
    }
  }, [hydrated, source, storeCart.items]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // Wishlist storage is a progressive enhancement.
    }
  }, [hydrated, wishlist]);

  const track = useCallback((event: string, payload: AnalyticsPayload = {}) => {
    if (typeof window === "undefined") return;
    const detail = { event, ...payload };
    window.dispatchEvent(new CustomEvent("naturemist:analytics", { detail }));
    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push(detail);
  }, []);

  const openCart = useCallback(() => {
    setIsSearchOpen(false);
    setIsCartOpen(true);
    track("view_cart");
  }, [track]);

  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openSearch = useCallback(() => {
    setIsCartOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const beginOperation = useCallback(() => {
    if (busyRef.current) {
      setCartError("Please wait for the current bag update to finish.");
      return false;
    }
    busyRef.current = true;
    setIsCartBusy(true);
    setCartError("");
    setCartWarnings([]);
    return true;
  }, []);

  const finishOperation = useCallback(() => {
    busyRef.current = false;
    setIsCartBusy(false);
  }, []);

  const handleApiPayload = useCallback(
    (payload: CartApiPayload, successMessage: string) => {
      if (payload.cart) commitCart(payload.cart);
      const userErrors = payload.userErrors || [];
      const warnings = payload.warnings || [];
      setCartWarnings(warnings);
      if (userErrors.length) {
        setCartError(userErrors[0].message);
        setAnnouncement(userErrors[0].message);
      } else {
        setAnnouncement(warnings[0]?.message || successMessage);
      }
      return userErrors.length ? null : payload.cart;
    },
    [commitCart],
  );

  const handleOperationError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Your bag could not be updated. Please try again.";
      if (error instanceof CartApiError && error.code === "CART_EXPIRED") {
        commitCart(emptyCart(fallbackCurrency));
      }
      setCartError(message);
      setAnnouncement(message);
    },
    [commitCart, fallbackCurrency],
  );

  const addToCart = useCallback(
    async (
      slug: string,
      quantity = 1,
      openDrawer = true,
      variantId?: string,
    ) => {
      const product = productsBySlug.get(slug);
      if (!product) {
        setCartError("This product is no longer available in the catalogue.");
        return null;
      }
      const variant = selectVariant(product, variantId);
      if (variantId && !variant && source === "preview") {
        setCartError("The selected product option is no longer available.");
        return null;
      }
      if (!productAvailability(product, variant)) {
        const message = `${product.name} is currently sold out.`;
        setCartError(message);
        setAnnouncement(message);
        return null;
      }

      const maximum = variantMaximum(variant);
      const merchandiseId = variant?.id || variantId || null;
      const existingQuantity = cartRef.current.items
        .filter((item) =>
          merchandiseId
            ? item.variantId === merchandiseId
            : item.slug === product.slug && !item.variantId,
        )
        .reduce((total, item) => total + item.quantity, 0);
      const requestedQuantity = normalizeQuantity(quantity);
      const safeQuantity = Math.min(requestedQuantity, maximum - existingQuantity);
      if (safeQuantity < 1) {
        const message = `The available quantity of ${product.name} is already in your bag.`;
        setCartError(message);
        setAnnouncement(message);
        if (openDrawer) setIsCartOpen(true);
        return null;
      }
      if (!beginOperation()) return null;
      if (openDrawer) {
        setIsSearchOpen(false);
        setIsCartOpen(true);
      }

      const pricePaise = variant?.pricePaise ?? product.pricePaise;
      const currencyCode = variant?.currencyCode || product.currencyCode || "INR";
      try {
        let nextCart: StoreCart | null;
        if (source === "preview") {
          const newLine = previewLine(product, safeQuantity, variant);
          const existing = cartRef.current.items.find(
            (item) => item.lineId === newLine.lineId,
          );
          const items = existing
            ? cartRef.current.items.map((item) =>
                item.lineId === newLine.lineId
                  ? {
                      ...item,
                      quantity: Math.min(maximum, item.quantity + safeQuantity),
                    }
                  : item,
              )
            : [...cartRef.current.items, newLine];
          nextCart = previewCart(items, fallbackCurrency);
          commitCart(nextCart);
          setAnnouncement(`${product.name} added to your bag.`);
        } else {
          if (!merchandiseId) {
            throw new Error("This product does not have a purchasable Shopify variant.");
          }
          const payload = await mutateCart({
            action: "add",
            lines: [{ merchandiseId, quantity: safeQuantity }],
          });
          nextCart = handleApiPayload(
            payload,
            `${product.name} added to your bag.`,
          );
        }

        if (nextCart) {
          track("add_to_cart", {
            item_id: merchandiseId || slug,
            item_variant: variant?.title,
            quantity: safeQuantity,
            value: (pricePaise * safeQuantity) / 100,
            currency: currencyCode,
          });
        }
        return nextCart;
      } catch (error) {
        handleOperationError(error);
        return null;
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      commitCart,
      fallbackCurrency,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      productsBySlug,
      source,
      track,
    ],
  );

  const addManyToCart = useCallback(
    async (slugs: readonly string[]) => {
      const selections = slugs.flatMap((slug) => {
        const product = productsBySlug.get(slug);
        if (!product) return [];
        const variant = selectVariant(product);
        return productAvailability(product, variant) && variantMaximum(variant) > 0
          ? [{ product, variant }]
          : [];
      });
      if (!selections.length) {
        const message = "None of the selected ritual jars are currently available.";
        setCartError(message);
        setAnnouncement(message);
        return null;
      }
      if (!beginOperation()) return null;
      setIsSearchOpen(false);
      setIsCartOpen(true);

      try {
        let nextCart: StoreCart | null;
        if (source === "preview") {
          let items = [...cartRef.current.items];
          for (const { product, variant } of selections) {
            const line = previewLine(product, 1, variant);
            const maximum = variantMaximum(variant);
            const existing = items.find((item) => item.lineId === line.lineId);
            items = existing
              ? items.map((item) =>
                  item.lineId === line.lineId
                    ? { ...item, quantity: Math.min(maximum, item.quantity + 1) }
                    : item,
                )
              : [...items, line];
          }
          nextCart = previewCart(items, fallbackCurrency);
          commitCart(nextCart);
          setAnnouncement(`${selections.length} ritual jars added to your bag.`);
        } else {
          const quantities = new Map<string, number>();
          for (const { variant } of selections) {
            if (!variant?.id) continue;
            quantities.set(variant.id, (quantities.get(variant.id) || 0) + 1);
          }
          const lines = Array.from(quantities, ([merchandiseId, quantity]) => ({
            merchandiseId,
            quantity,
          }));
          if (!lines.length) {
            throw new Error("The selected products do not have purchasable Shopify variants.");
          }
          const payload = await mutateCart({ action: "add", lines });
          nextCart = handleApiPayload(
            payload,
            `${selections.length} ritual jars added to your bag.`,
          );
        }

        if (nextCart) {
          track("add_to_cart", {
            item_count: selections.length,
            mode: "bundle",
            currency: nextCart.currencyCode,
          });
        }
        return nextCart;
      } catch (error) {
        handleOperationError(error);
        return null;
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      commitCart,
      fallbackCurrency,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      productsBySlug,
      source,
      track,
    ],
  );

  const removeFromCart = useCallback(
    async (identifier: string) => {
      const item = cartRef.current.items.find(
        (entry) => entry.lineId === identifier || entry.slug === identifier,
      );
      if (!item || !beginOperation()) return;

      try {
        if (source === "preview") {
          const nextCart = previewCart(
            cartRef.current.items.filter((entry) => entry.lineId !== item.lineId),
            fallbackCurrency,
          );
          commitCart(nextCart);
          setAnnouncement(`${item.productName} removed from your bag.`);
        } else {
          const payload = await mutateCart({
            action: "remove",
            lineIds: [item.lineId],
          });
          handleApiPayload(payload, `${item.productName} removed from your bag.`);
        }
        track("remove_from_cart", {
          item_id: item.variantId || item.slug,
          quantity: item.quantity,
        });
      } catch (error) {
        handleOperationError(error);
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      commitCart,
      fallbackCurrency,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      source,
      track,
    ],
  );

  const updateQuantity = useCallback(
    async (identifier: string, quantity: number) => {
      const item = cartRef.current.items.find(
        (entry) => entry.lineId === identifier || entry.slug === identifier,
      );
      if (!item) return;
      if (quantity <= 0) {
        await removeFromCart(item.lineId);
        return;
      }
      const maximum = Math.min(
        MAX_CART_QUANTITY,
        item.quantityAvailable ?? MAX_CART_QUANTITY,
      );
      const safeQuantity = normalizeQuantity(quantity, maximum);
      if (safeQuantity === item.quantity || !beginOperation()) return;

      try {
        if (source === "preview") {
          const nextCart = previewCart(
            cartRef.current.items.map((entry) =>
              entry.lineId === item.lineId
                ? { ...entry, quantity: safeQuantity }
                : entry,
            ),
            fallbackCurrency,
          );
          commitCart(nextCart);
          setAnnouncement(`${item.productName} quantity updated.`);
        } else {
          const payload = await mutateCart({
            action: "update",
            lines: [{ id: item.lineId, quantity: safeQuantity }],
          });
          handleApiPayload(payload, `${item.productName} quantity updated.`);
        }
      } catch (error) {
        handleOperationError(error);
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      commitCart,
      fallbackCurrency,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      removeFromCart,
      source,
    ],
  );

  const clearCart = useCallback(async () => {
    const current = cartRef.current;
    if (!current.items.length || !beginOperation()) return;
    try {
      if (source === "preview") {
        commitCart(emptyCart(fallbackCurrency));
        setAnnouncement("Your bag is now empty.");
      } else {
        const payload = await mutateCart({
          action: "remove",
          lineIds: current.items.map((item) => item.lineId),
        });
        handleApiPayload(payload, "Your bag is now empty.");
      }
    } catch (error) {
      handleOperationError(error);
    } finally {
      finishOperation();
    }
  }, [
    beginOperation,
    commitCart,
    fallbackCurrency,
    finishOperation,
    handleApiPayload,
    handleOperationError,
    source,
  ]);

  const applyDiscountCode = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      if (!code) {
        setCartError("Enter a discount code to check it.");
        return false;
      }
      if (source === "preview") {
        const message = "Discount codes are checked by Shopify on the live store.";
        setCartError(message);
        setAnnouncement(message);
        return false;
      }
      if (!cartRef.current.items.length) {
        setCartError("Add an item before applying a discount code.");
        return false;
      }
      if (!beginOperation()) return false;

      try {
        const currentCodes = cartRef.current.discountCodes.map(
          (discount) => discount.code,
        );
        const codes = currentCodes.some(
          (existing) => existing.toLocaleLowerCase() === code.toLocaleLowerCase(),
        )
          ? currentCodes
          : [...currentCodes, code];
        const payload = await mutateCart({ action: "discount", discountCodes: codes });
        const updated = handleApiPayload(payload, `Discount code ${code} checked.`);
        const discount = updated?.discountCodes.find(
          (entry) => entry.code.toLocaleLowerCase() === code.toLocaleLowerCase(),
        );
        if (!discount?.applicable) {
          const message = `${code} is not valid for the items in this bag.`;
          setCartError(message);
          setAnnouncement(message);
          return false;
        }
        setAnnouncement(`${discount.code} applied to your bag.`);
        track("apply_discount", { code: discount.code });
        return true;
      } catch (error) {
        handleOperationError(error);
        return false;
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      source,
      track,
    ],
  );

  const removeDiscountCode = useCallback(
    async (code: string) => {
      if (source !== "shopify" || !beginOperation()) return;
      try {
        const codes = cartRef.current.discountCodes
          .filter(
            (discount) =>
              discount.code.toLocaleLowerCase() !== code.toLocaleLowerCase(),
          )
          .map((discount) => discount.code);
        const payload = await mutateCart({ action: "discount", discountCodes: codes });
        handleApiPayload(payload, `${code} removed from your bag.`);
      } catch (error) {
        handleOperationError(error);
      } finally {
        finishOperation();
      }
    },
    [
      beginOperation,
      finishOperation,
      handleApiPayload,
      handleOperationError,
      source,
    ],
  );

  const toggleWishlist = useCallback(
    (slug: string) => {
      const product = productsBySlug.get(slug);
      if (!product) return;
      const exists = wishlist.includes(slug);
      setWishlist((current) =>
        current.includes(slug)
          ? current.filter((item) => item !== slug)
          : [...current, slug],
      );
      setAnnouncement(
        `${product.name} ${exists ? "removed from" : "saved to"} your wishlist.`,
      );
      track(exists ? "remove_from_wishlist" : "add_to_wishlist", {
        item_id: slug,
      });
    },
    [productsBySlug, track, wishlist],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products: initialProducts,
      bundles: initialBundles,
      content,
      source,
      cart: storeCart.items,
      cartCount: storeCart.totalQuantity,
      subtotalPaise: storeCart.subtotalPaise,
      totalPaise: storeCart.totalPaise,
      discountAmountPaise: storeCart.discountAmountPaise,
      currencyCode: storeCart.currencyCode,
      totalsEstimated: storeCart.subtotalEstimated || storeCart.totalEstimated,
      discountCodes: storeCart.discountCodes,
      checkoutUrl: storeCart.checkoutUrl,
      cartError,
      cartWarnings,
      isCartBusy,
      wishlist,
      isHydrated: hydrated,
      isCartOpen,
      isSearchOpen,
      announcement,
      addToCart,
      addManyToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      applyDiscountCode,
      removeDiscountCode,
      clearCartError,
      toggleWishlist,
      isWishlisted: (slug) => wishlist.includes(slug),
      openCart,
      closeCart,
      openSearch,
      closeSearch,
      track,
    }),
    [
      addManyToCart,
      addToCart,
      announcement,
      applyDiscountCode,
      cartError,
      cartWarnings,
      clearCart,
      clearCartError,
      closeCart,
      closeSearch,
      content,
      hydrated,
      initialBundles,
      initialProducts,
      isCartBusy,
      isCartOpen,
      isSearchOpen,
      openCart,
      openSearch,
      removeDiscountCode,
      removeFromCart,
      source,
      storeCart,
      toggleWishlist,
      track,
      updateQuantity,
      wishlist,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
