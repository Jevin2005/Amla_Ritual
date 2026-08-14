"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { formatCurrency, getProduct, products } from "@/lib/products";
import { ProductJar } from "@/components/product-jar";
import { useStore } from "@/components/store-provider";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useModalFocus(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = node?.querySelectorAll<HTMLElement>(focusableSelector);
    const preferredFocus = node?.querySelector<HTMLElement>("[data-autofocus]");
    (preferredFocus || focusables?.[0])?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.classList.add("has-overlay");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("has-overlay");
      previousFocus?.focus();
    };
  }, [active, onClose, ref]);
}

function BrandMark() {
  return (
    <span className="brand-lockup" aria-label="NatureMist home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="brand-word">NatureMist</span>
      <span className="brand-subline">Botanical rituals</span>
    </span>
  );
}

export function SiteHeader() {
  const { cartCount, wishlist, openCart, openSearch } = useStore();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useModalFocus(mobileOpen, mobileRef, () => setMobileOpen(false));

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="announcement-bar">
        <p>
          Rooted in Ayurveda <span aria-hidden="true">•</span> Made for modern rituals
        </p>
        <Link href="/rituals">Find your ritual <span aria-hidden="true">↗</span></Link>
      </div>
      <header className={`site-header ${compact ? "is-compact" : ""}`}>
        <nav className="site-nav" aria-label="Primary navigation">
          <div className="site-nav__left">
            <Link className="nav-link" href="/shop">
              Shop
            </Link>
            <Link className="nav-link" href="/rituals">
              Rituals
            </Link>
            <Link className="nav-link" href="/our-story">
              Our Story
            </Link>
          </div>
          <Link className="site-nav__logo" href="/">
            <BrandMark />
          </Link>
          <div className="site-nav__actions">
            <button className="text-action desktop-action" type="button" onClick={openSearch}>
              Search
            </button>
            <Link className="text-action desktop-action" href="/wishlist">
              Wishlist <span className="count-badge">{wishlist.length}</span>
            </Link>
            <button className="text-action" type="button" onClick={openCart}>
              Bag <span className="count-badge">{cartCount}</span>
            </button>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div className={`overlay-shell ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <button
          className="overlay-backdrop"
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className="mobile-menu"
          ref={mobileRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="panel-header">
            <BrandMark />
            <button type="button" className="close-button" onClick={() => setMobileOpen(false)}>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="mobile-menu__links">
            <Link href="/shop" onClick={() => setMobileOpen(false)}>Shop the botanicals <span>01</span></Link>
            <Link href="/rituals" onClick={() => setMobileOpen(false)}>Choose your ritual <span>02</span></Link>
            <Link href="/our-story" onClick={() => setMobileOpen(false)}>Our story <span>03</span></Link>
            <Link href="/wishlist" onClick={() => setMobileOpen(false)}>Saved rituals <span>{wishlist.length.toString().padStart(2, "0")}</span></Link>
          </div>
          <button
            type="button"
            className="button button--outline button--full"
            onClick={() => {
              setMobileOpen(false);
              openSearch();
            }}
          >
            Search botanicals
          </button>
          <p className="mobile-menu__note">One ingredient. Clearly explained.</p>
        </aside>
      </div>
    </>
  );
}

export function SearchDialog() {
  const { isSearchOpen, closeSearch, track } = useStore();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeDialog = useCallback(() => {
    setQuery("");
    closeSearch();
  }, [closeSearch]);
  useModalFocus(isSearchOpen, dialogRef, closeDialog);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.botanical, product.subtitle, ...product.searchTerms]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <div className={`overlay-shell ${isSearchOpen ? "is-open" : ""}`} aria-hidden={!isSearchOpen}>
      <button
        className="overlay-backdrop"
        type="button"
        onClick={closeDialog}
        aria-label="Close search"
        tabIndex={isSearchOpen ? 0 : -1}
      />
      <section
        className="search-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
      >
        <div className="search-dialog__topline">
          <p className="eyebrow" id="search-title">Search NatureMist</p>
          <button type="button" className="close-button" onClick={closeDialog}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close search</span>
          </button>
        </div>
        <label className="search-field">
          <span className="sr-only">Search botanicals and ritual goals</span>
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘shine’, ‘soapnut’ or ‘colour’"
            autoComplete="off"
          />
          <span aria-hidden="true">↗</span>
        </label>
        <div className="search-dialog__meta" aria-live="polite">
          <span>{results.length} botanical{results.length === 1 ? "" : "s"}</span>
          {query && (
            <button type="button" onClick={() => setQuery("")}>
              Clear search
            </button>
          )}
        </div>
        <div className="search-results">
          {results.map((product) => (
            <Link
              className="search-result"
              href={`/shop/${product.slug}`}
              key={product.slug}
              onClick={() => {
                track("search", { result_count: results.length, selected_item: product.slug });
                closeDialog();
              }}
            >
              <span
                className="search-result__swatch"
                style={{ backgroundColor: product.accentSoft }}
                aria-hidden="true"
              >
                <ProductJar product={product} size="small" decorative />
              </span>
              <span>
                <strong>{product.name}</strong>
                <small>{product.subtitle}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          {results.length === 0 && (
            <div className="empty-state">
              <p className="display-small">No ritual found.</p>
              <p>Try a botanical name or a goal such as cleanse, softness or colour.</p>
              <button className="text-link" type="button" onClick={() => setQuery("")}>
                See all botanicals
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function CartDrawer() {
  const {
    cart,
    subtotalPaise,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useStore();
  const [discount, setDiscount] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const drawerRef = useRef<HTMLElement>(null);
  useModalFocus(isCartOpen, drawerRef, closeCart);

  const applyDiscount = (event: FormEvent) => {
    event.preventDefault();
    setDiscountMessage(
      discount.trim()
        ? "Discount codes will activate when launch terms are confirmed."
        : "Enter a code to check it.",
    );
  };

  return (
    <div className={`overlay-shell ${isCartOpen ? "is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button
        className="overlay-backdrop"
        type="button"
        onClick={closeCart}
        aria-label="Close bag"
        tabIndex={isCartOpen ? 0 : -1}
      />
      <aside
        className="cart-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2 id="bag-title">Ritual bag</h2>
          </div>
          <button type="button" className="close-button" onClick={closeCart}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close bag</span>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty empty-state">
            <span className="empty-state__mark" aria-hidden="true">○</span>
            <p className="display-small">Your ritual begins here.</p>
            <p>Explore six single botanicals, each with a clearly explained purpose.</p>
            <Link className="button button--dark" href="/shop" onClick={closeCart}>
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <article className="cart-item" key={item.slug}>
                    <div
                      className="cart-item__visual"
                      style={{ backgroundColor: product.accentSoft }}
                    >
                      <ProductJar product={product} size="small" decorative />
                    </div>
                    <div className="cart-item__details">
                      <div>
                        <Link href={`/shop/${product.slug}`} onClick={closeCart}>
                          {product.name}
                        </Link>
                        <p>{product.subtitle}</p>
                      </div>
                      <div className="cart-item__controls">
                        <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity - 1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                        <strong>{formatCurrency(product.pricePaise * item.quantity)}</strong>
                      </div>
                      <button
                        className="remove-link"
                        type="button"
                        onClick={() => removeFromCart(product.slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="cart-summary">
              <form className="discount-form" onSubmit={applyDiscount}>
                <label htmlFor="discount-code">Discount code</label>
                <div>
                  <input
                    id="discount-code"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    placeholder="Enter code"
                  />
                  <button type="submit">Apply</button>
                </div>
                {discountMessage && <p role="status">{discountMessage}</p>}
              </form>
              <div className="subtotal-line">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotalPaise)}</strong>
              </div>
              <p className="commercial-note">
                Preview pricing only. Final prices, shipping and taxes will be confirmed before launch.
              </p>
              <Link className="button button--dark button--full" href="/checkout" onClick={closeCart}>
                Continue to checkout <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link text-link--center" href="/shop" onClick={closeCart}>
                Continue exploring
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { track } = useStore();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }
    setMessage("Thank you. Sign-up is ready to connect; your email was not stored in this preview.");
    setEmail("");
    track("newsletter_signup", { status: "preview_validated" });
  };

  return (
    <form className="newsletter-form" onSubmit={submit} noValidate>
      <label htmlFor="newsletter-email">Email address</label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby="newsletter-note"
          required
        />
        <button type="submit" aria-label="Join the NatureMist newsletter">↗</button>
      </div>
      <p id="newsletter-note" role="status">{message || "No noise. Just thoughtful ritual notes."}</p>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="newsletter">
      <div className="site-footer__newsletter">
        <div>
          <p className="eyebrow eyebrow--light">A quieter kind of beauty note</p>
          <h2>Rituals worth returning to.</h2>
        </div>
        <div>
          <p>Ingredient stories, preparation guides and thoughtful new arrivals.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="site-footer__links">
        <div className="site-footer__brand">
          <BrandMark />
          <p>Traditional Indian botanicals, translated into clear and considered care.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/shop">All botanicals</Link>
          <Link href="/shop?goal=Cleanse">Cleansing rituals</Link>
          <Link href="/shop?goal=Softness+%2B+Shine">Softness + shine</Link>
          <Link href="/shop?goal=Botanical+Colour">Botanical colour</Link>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/rituals">Build your ritual</Link>
          <Link href="/our-story">Our story</Link>
          <Link href="/#ingredient-standards">Ingredient standards</Link>
          <Link href="/#faq">Frequently asked</Link>
        </div>
        <div>
          <h3>Care</h3>
          <Link href="/track-order">Track an order</Link>
          <Link href="/shipping-returns">Shipping + returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} NatureMist</span>
        <span>Rooted in Ayurveda. Made for modern rituals.</span>
        <span>India · Worldwide vision</span>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <SearchDialog />
      <CartDrawer />
    </>
  );
}
