"use client";

import Link from "next/link";
import { formatCurrency, getProduct } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function CheckoutPreview() {
  const { cart, isHydrated, subtotalPaise, openCart } = useStore();

  if (!isHydrated) {
    return (
      <section
        className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]"
        aria-busy="true"
        aria-live="polite"
      >
        <span
          className="mb-[30px] grid size-[90px] animate-pulse place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)] motion-reduce:animate-none"
          aria-hidden="true"
        >
          ○
        </span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
          Restoring your ritual bag.
        </p>
        <p className="max-w-[360px] text-[var(--muted)]">
          Checking the botanicals saved on this device&hellip;
        </p>
      </section>
    );
  }

  if (!cart.length) {
    return (
      <section className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]">
        <span className="mb-[30px] grid size-[90px] place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)]" aria-hidden="true">○</span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">Your bag is waiting.</p>
        <p className="max-w-[360px] text-[var(--muted)]">Add a botanical ritual before continuing to checkout.</p>
        <Link className="mt-[15px] inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,color,border-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]" href="/shop">Shop the collection</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_0.82fr] gap-[clamp(52px,7vw,96px)] px-[clamp(24px,5vw,64px)] pb-[140px] pt-[95px] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pb-[100px] max-[680px]:pt-[72px]">
      <div>
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">Secure checkout handoff</p>
        <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(3.2rem,5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[var(--forest)] text-balance">Ready for your verified payment provider.</h2>
        <p className="max-w-[650px] leading-[1.75] text-[var(--muted)]">
          This storefront preview deliberately does not collect card details or create a pretend order. Connect your chosen hosted checkout provider before launch, then this step can hand over the exact bag safely.
        </p>
        <div className="my-7 grid gap-[7px] rounded-[var(--radius-md)] border border-[var(--line)] border-l-[4px] border-l-[var(--amla)] bg-[var(--paper)] p-6 shadow-[0_12px_34px_rgba(21,59,45,0.06)]">
          <strong>No payment data is collected here.</strong>
          <span className="text-[0.78rem] text-[var(--muted)]">Prices, inventory, shipping, tax and discount rules must also be confirmed before accepting an order.</span>
        </div>
        <ol className="mb-8 grid list-none gap-3 p-0" aria-label="Checkout connection steps">
          {[
            ["01", "Confirm commercial details"],
            ["02", "Connect a hosted payment provider"],
            ["03", "Test fulfilment and customer receipts"],
          ].map(([number, label]) => (
            <li className="flex items-center gap-3 border-b border-[var(--line)] py-3 text-[0.78rem] text-[var(--muted)]" key={number}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--paper)] text-[0.62rem] font-bold text-[var(--botanical)] ring-1 ring-[var(--line)]">{number}</span>
              {label}
            </li>
          ))}
        </ol>
        <button className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-[var(--paper)]" type="button" onClick={openCart}>Return to bag</button>
        <Link className="ml-[22px] inline-flex items-center gap-3.5 border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px] max-[680px]:ml-0 max-[680px]:mt-5" href="/shop">Continue exploring ↗</Link>
      </div>
      <aside className="self-start rounded-[var(--radius-lg)] bg-[var(--paper)] p-[30px] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+24px)] max-[680px]:rounded-[var(--radius-md)] max-[680px]:px-5 max-[680px]:py-6" aria-label="Order preview">
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">Order preview</p>
        <div className="border-t border-[var(--line)]">
          {cart.map((item) => {
            const product = getProduct(item.slug);
            if (!product) return null;
            return (
              <article className="grid grid-cols-[68px_1fr_auto] items-center gap-3 border-b border-[var(--line)] py-[15px] max-[680px]:grid-cols-[58px_1fr]" key={item.slug}>
                <span className="flex h-[82px] w-[68px] items-end justify-center overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[var(--line)]" style={{ backgroundColor: product.accentSoft }}><ProductJar product={product} size="small" className="origin-bottom scale-50" decorative /></span>
                <div><strong className="block font-serif font-normal text-[var(--forest)]">{product.name}</strong><small className="text-[0.68rem] text-[var(--muted)]">Quantity {item.quantity}</small></div>
                <em className="font-serif not-italic text-[var(--forest)] max-[680px]:col-start-2">{formatCurrency(product.pricePaise * item.quantity)}</em>
              </article>
            );
          })}
        </div>
        <div className="mt-[22px] flex items-center justify-between border-t border-[var(--line)] pb-[10px] pt-[22px] text-[var(--forest)]"><span>Preview subtotal</span><strong className="font-serif text-[1.4rem] font-normal">{formatCurrency(subtotalPaise)}</strong></div>
        <p className="mt-3 text-[0.74rem] leading-[1.65] text-[var(--muted)]">Not a final payable total. Shipping, tax and verified commercial terms are not yet applied.</p>
      </aside>
    </section>
  );
}
