"use client";

import Link from "next/link";
import { products } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { useStore } from "@/features/store/store-provider";

export function WishlistPage() {
  const { wishlist } = useStore();
  const savedProducts = products.filter((product) => wishlist.includes(product.slug));

  if (!savedProducts.length) {
    return (
      <section className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]">
        <span className="mb-[30px] grid size-[90px] place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)]" aria-hidden="true">♡</span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">Save a ritual for later.</p>
        <p className="max-w-[360px] text-[var(--muted)]">Your favourite botanicals will remain here on this device while you explore.</p>
        <Link className="mt-[15px] inline-flex min-h-[50px] items-center justify-center gap-[22px] border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)]" href="/shop">Explore the collection</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-[600px] w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(84px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[75px]" aria-labelledby="saved-title">
      <div className="flex items-center justify-between px-0 pb-[22px] pt-[30px] max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-1">
        <h2 className="m-0 font-serif text-[1.7rem] font-normal text-[var(--forest)]" id="saved-title">{savedProducts.length} saved ritual{savedProducts.length === 1 ? "" : "s"}</h2>
        <span className="text-[0.61rem] uppercase tracking-[0.1em] text-[var(--muted)]">Saved on this device</span>
      </div>
      <div className="grid grid-cols-3 gap-[22px] max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:[&>*]:w-full [&>article>div:first-child]:h-[clamp(330px,28vw,430px)] max-[680px]:[&>article>div:first-child]:h-[360px]">
        {savedProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </section>
  );
}
