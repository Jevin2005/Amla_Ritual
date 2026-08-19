"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { formatCurrency, getProduct } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";

const darkButtonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,color,border-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)] hover:[transform:translateY(-2px)]";
const textLinkClass =
  "items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px]";

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
    <div
      className={`fixed inset-0 z-[500] ${
        isCartOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isCartOpen}
    >
      <button
        className={`absolute inset-0 bg-[rgba(11,29,18,0.56)] backdrop-blur-[4px] transition-opacity duration-[380ms] ease-[ease] ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={closeCart}
        aria-label="Close bag"
        tabIndex={isCartOpen ? 0 : -1}
      />
      <aside
        className={`absolute inset-y-0 right-0 w-[min(500px,100%)] overflow-y-auto rounded-l-[var(--radius-lg)] bg-[var(--paper)] shadow-[-30px_0_70px_rgba(0,0,0,0.15)] transition-[transform] duration-[520ms] ease-[var(--ease)] max-[680px]:rounded-none ${
          isCartOpen ? "[transform:translateX(0)]" : "[transform:translateX(102%)]"
        }`}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
      >
        <div className="sticky top-0 z-10 flex min-h-[105px] items-center justify-between border-b border-[var(--line)] bg-[rgba(255,252,245,0.92)] px-[30px] py-[22px] backdrop-blur-xl max-[680px]:min-h-[88px] max-[680px]:px-5 max-[680px]:py-[17px]">
          <div>
            <p className="m-0 mb-1 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase">
              Your selection
            </p>
            <h2
              className="m-0 font-serif text-[2.2rem] leading-none font-normal text-[var(--forest)]"
              id="bag-title"
            >
              Ritual bag
            </h2>
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-transparent text-[1.5rem] text-[var(--forest)] transition-[transform,background] duration-[280ms] ease-[ease] hover:bg-[var(--ivory)] hover:[transform:rotate(90deg)]"
            onClick={closeCart}
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close bag</span>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex min-h-[calc(100vh_-_105px)] flex-col items-center justify-center p-[45px] text-center">
            <span
              className="mb-[30px] grid h-[90px] w-[90px] place-items-center rounded-full border border-[var(--line)] text-[1.5rem] text-[var(--botanical)]"
              aria-hidden="true"
            >
              ◯
            </span>
            <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
              Your ritual begins here.
            </p>
            <p className="max-w-[360px] text-[var(--muted)]">
              Explore six single botanicals, each with a clearly explained purpose.
            </p>
            <Link
              className={`${darkButtonClass} mt-[15px]`}
              href="/shop"
              onClick={closeCart}
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="px-[30px] max-[680px]:px-5">
              {cart.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <article
                    className="grid grid-cols-[115px_1fr] gap-5 border-b border-[var(--line)] py-[26px] max-[680px]:grid-cols-[96px_1fr]"
                    key={item.slug}
                  >
                    <div
                      className="flex h-[150px] items-end justify-center overflow-hidden rounded-[var(--radius-sm)] pb-[5px] ring-1 ring-[var(--line)]"
                      style={{ backgroundColor: product.accentSoft }}
                    >
                      <ProductJar product={product} size="small" decorative />
                    </div>
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <Link
                          className="font-serif text-[1.35rem] text-[var(--forest)]"
                          href={`/shop/${product.slug}`}
                          onClick={closeCart}
                        >
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-[0.68rem] text-[var(--muted)]">
                          {product.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div
                            className="inline-grid h-[40px] grid-cols-[38px_32px_38px] items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--ivory)]"
                          aria-label={`Quantity for ${product.name}`}
                        >
                          <button
                            className="h-9 bg-transparent"
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity - 1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span className="text-center" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            className="h-9 bg-transparent"
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                        <strong className="font-serif text-[1.05rem] font-normal text-[var(--forest)]">
                          {formatCurrency(product.pricePaise * item.quantity)}
                        </strong>
                      </div>
                      <button
                        className="self-start border-b border-[var(--line)] bg-transparent pb-0.5 text-[0.6rem] tracking-[0.08em] text-[var(--muted)] uppercase"
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
            <div className="bg-[var(--ivory)] px-[30px] pt-[26px] pb-[35px] max-[680px]:px-5">
              <form onSubmit={applyDiscount}>
                <label
                  className="mb-[7px] block text-[0.62rem] font-bold tracking-[0.09em] text-[var(--forest)] uppercase"
                  htmlFor="discount-code"
                >
                  Discount code
                </label>
                <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[var(--line)] focus-within:ring-[var(--botanical)]">
                  <input
                    className="h-[52px] min-w-0 rounded-none border-0 bg-[var(--paper)] px-4 outline-none focus:shadow-none"
                    id="discount-code"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    placeholder="Enter code"
                  />
                  <button
                    className="bg-[var(--forest)] px-5 text-[0.66rem] font-bold tracking-[0.08em] text-[var(--paper)] uppercase transition-colors hover:bg-[var(--forest-dark)]"
                    type="submit"
                  >
                    Apply
                  </button>
                </div>
                {discountMessage && (
                  <p className="mt-[7px] text-[0.65rem] text-[var(--muted)]" role="status">
                    {discountMessage}
                  </p>
                )}
              </form>
              <div className="mt-[22px] flex items-center justify-between border-t border-[var(--line)] px-0 pt-[22px] pb-2.5 text-[var(--forest)]">
                <span>Subtotal</span>
                <strong className="font-serif text-[1.4rem] font-normal">
                  {formatCurrency(subtotalPaise)}
                </strong>
              </div>
              <p className="mt-3 text-[0.7rem] leading-[1.6] text-[var(--muted)]">
                Preview pricing only. Final prices, shipping and taxes will be confirmed before launch.
              </p>
              <Link
                className={`${darkButtonClass} mt-5 w-full`}
                href="/checkout"
                onClick={closeCart}
              >
                Continue to checkout <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className={`mx-auto mt-[18px] flex w-max justify-center ${textLinkClass}`}
                href="/shop"
                onClick={closeCart}
              >
                Continue exploring
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
