"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, products } from "@/lib/products";

type CartItem = {
  slug: string;
  quantity: number;
};

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  subtotalPaise: number;
  wishlist: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  announcement: string;
  addToCart: (slug: string, quantity?: number, openDrawer?: boolean) => void;
  addManyToCart: (slugs: readonly string[]) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  track: (event: string, payload?: AnalyticsPayload) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "naturemist-cart-v1";
const WISHLIST_KEY = "naturemist-wishlist-v1";

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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedCart = readStoredArray<CartItem>(CART_KEY).filter(
        (item) =>
          typeof item?.slug === "string" &&
          Number.isFinite(item?.quantity) &&
          item.quantity > 0 &&
          Boolean(getProduct(item.slug)),
      );
      const savedWishlist = readStoredArray<string>(WISHLIST_KEY).filter(
        (slug) => typeof slug === "string" && Boolean(getProduct(slug)),
      );
      setCart(savedCart);
      setWishlist([...new Set(savedWishlist)]);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Storage is a progressive enhancement; the session still works without it.
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage is a progressive enhancement; the session still works without it.
    }
  }, [wishlist, hydrated]);

  const track = useCallback((event: string, payload: AnalyticsPayload = {}) => {
    if (typeof window === "undefined") return;
    const detail = { event, ...payload };
    window.dispatchEvent(new CustomEvent("naturemist:analytics", { detail }));
    const analyticsWindow = window as Window & {
      dataLayer?: Array<Record<string, unknown>>;
    };
    analyticsWindow.dataLayer?.push(detail);
  }, []);

  const addToCart = useCallback(
    (slug: string, quantity = 1, openDrawer = true) => {
      const product = getProduct(slug);
      if (!product) return;
      const safeQuantity = Math.max(1, Math.min(12, Math.floor(quantity)));
      setCart((current) => {
        const existing = current.find((item) => item.slug === slug);
        if (existing) {
          return current.map((item) =>
            item.slug === slug
              ? { ...item, quantity: Math.min(12, item.quantity + safeQuantity) }
              : item,
          );
        }
        return [...current, { slug, quantity: safeQuantity }];
      });
      setAnnouncement(`${product.name} added to your bag.`);
      track("add_to_cart", {
        item_id: slug,
        quantity: safeQuantity,
        value: product.pricePaise / 100,
        currency: "INR",
      });
      if (openDrawer) setIsCartOpen(true);
    },
    [track],
  );

  const addManyToCart = useCallback(
    (slugs: readonly string[]) => {
      slugs.forEach((slug) => addToCart(slug, 1, false));
      setAnnouncement(`${slugs.length} ritual jars added to your bag.`);
      setIsCartOpen(true);
    },
    [addToCart],
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((current) => current.filter((item) => item.slug !== slug));
        const product = getProduct(slug);
        if (product) setAnnouncement(`${product.name} removed from your bag.`);
        track("remove_from_cart", { item_id: slug });
        return;
      }
      const safeQuantity = Math.max(1, Math.min(12, Math.floor(quantity)));
      setCart((current) =>
        current.map((item) =>
          item.slug === slug ? { ...item, quantity: safeQuantity } : item,
        ),
      );
    },
    [track],
  );

  const removeFromCart = useCallback(
    (slug: string) => updateQuantity(slug, 0),
    [updateQuantity],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAnnouncement("Your bag is now empty.");
  }, []);

  const toggleWishlist = useCallback(
    (slug: string) => {
      const product = getProduct(slug);
      if (!product) return;
      setWishlist((current) => {
        const exists = current.includes(slug);
        setAnnouncement(
          `${product.name} ${exists ? "removed from" : "saved to"} your wishlist.`,
        );
        track(exists ? "remove_from_wishlist" : "add_to_wishlist", {
          item_id: slug,
        });
        return exists
          ? current.filter((item) => item !== slug)
          : [...current, slug];
      });
    },
    [track],
  );

  const subtotalPaise = useMemo(
    () =>
      cart.reduce((total, item) => {
        const product = products.find((entry) => entry.slug === item.slug);
        return total + (product?.pricePaise ?? 0) * item.quantity;
      }, 0),
    [cart],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      subtotalPaise,
      wishlist,
      isCartOpen,
      isSearchOpen,
      announcement,
      addToCart,
      addManyToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted: (slug) => wishlist.includes(slug),
      openCart: () => {
        setIsSearchOpen(false);
        setIsCartOpen(true);
        track("view_cart");
      },
      closeCart: () => setIsCartOpen(false),
      openSearch: () => {
        setIsCartOpen(false);
        setIsSearchOpen(true);
      },
      closeSearch: () => setIsSearchOpen(false),
      track,
    }),
    [
      addManyToCart,
      addToCart,
      announcement,
      cart,
      clearCart,
      isCartOpen,
      isSearchOpen,
      removeFromCart,
      subtotalPaise,
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
