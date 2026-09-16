"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/domain/catalog/products";
import type { MotionSettings } from "@/domain/motion";
import { installBenefitsPointer, observeBenefitsEntrance } from "./product-benefits-motion";
import styles from "./product-benefits.module.css";

const benefits = [
  {
    title: "Follicle Vitality",
    description: "Delivers plant polyphenols and antioxidants to strengthen hair roots.",
    productSlug: "amla-powder",
  },
  {
    title: "Natural Slip & Cuticle Seal",
    description: "Gently detangles while imparting a reflective, silky sheen.",
    productSlug: "shikakai-powder",
  },
  {
    title: "Sebum Balance",
    description: "Purifies the scalp without stripping its essential natural moisture barrier.",
    productSlug: "reetha-powder",
  },
  {
    title: "Pure Pigment Depth",
    description: "Enhances rich natural hair tones with zero synthetic dyes or ammonia.",
    productSlug: "indigo-powder",
  },
];

const tickerItems = [...benefits.map(({ title }) => title), "Single-origin shade-dried herbs"];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductBenefits({ products, motionSettings }: {
  products: readonly Product[];
  motionSettings: MotionSettings;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const stopEntrance = observeBenefitsEntrance(section, motionSettings);
    const stopPointer = installBenefitsPointer(section, motionSettings);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const updateLoops = () => {
      section.dataset.motionRunning = String(inView && !document.hidden && motionSettings.enabled && !reduced.matches);
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateLoops();
    }) : undefined;
    if (observer) observer.observe(section);
    else inView = true;
    updateLoops();
    document.addEventListener("visibilitychange", updateLoops);
    reduced.addEventListener("change", updateLoops);
    return () => {
      stopEntrance();
      stopPointer();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateLoops);
      reduced.removeEventListener("change", updateLoops);
      delete section.dataset.motionRunning;
    };
  }, [motionSettings]);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="benefits-title" data-reveal-ignore>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow} data-benefit-reveal>Botanical efficacy</p>
            <h2 className={styles.heading} id="benefits-title">
              <span data-benefit-reveal>The benefit of</span>
              <em data-benefit-reveal>this product.</em>
            </h2>
          </div>
          <div className={styles.intro} data-benefit-reveal>
            <p>Proven botanical hair benefits formulated with pure, single-origin shade-dried herbs.</p>
            <div className={styles.actions}>
              <Link href="/shop" className={styles.button} data-benefits-button>
                <span className={styles.buttonSurface} data-benefits-button-surface>
                  Explore us <span className={styles.buttonArrow}><Arrow /></span>
                </span>
              </Link>
              <div className={styles.seal} aria-label="100%">
                <svg viewBox="0 0 56 56" fill="none" aria-hidden="true">
                  <circle cx="28" cy="28" r="26.5" stroke="currentColor" strokeWidth="0.7" />
                  <circle cx="28" cy="28" r="21.5" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1 4" />
                  <text x="28" y="32" textAnchor="middle" fill="currentColor" stroke="none">100%</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider} data-benefit-reveal data-benefits-divider />
        <ol className={styles.rows}>
          {benefits.map(({ title, description, productSlug }, index) => {
            const product = products.find(({ slug }) => slug === productSlug);
            const imageSrc = product?.featuredImage?.url || `/images/${productSlug}.jpg`;
            return (
              <li key={title} className={styles.row} data-benefit-row data-benefit-reveal>
                <Link className={styles.rowLink} href={product ? `/shop/${product.slug}` : "/shop"}>
                  <div className={styles.identity}>
                    <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.thumbnail} aria-hidden="true">
                      <Image src={imageSrc} alt="" fill sizes="64px" className={styles.productImage} />
                    </span>
                  </div>
                  <h3 className={styles.title}>{title}</h3>
                  <div className={styles.details} data-benefit-details>
                    <p className={styles.description}>{description}</p>
                    <span className={styles.productLink}>{product ? `Explore ${product.name}` : "Explore botanicals"}</span>
                  </div>
                  <span className={styles.rowArrow}><Arrow /></span>
                </Link>
                <div className={styles.preview} data-benefit-preview aria-hidden="true">
                  <Image src={imageSrc} alt="" fill sizes="230px" className={styles.productImage} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles.ticker} data-benefit-reveal aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map((copy) => (
            <div key={copy} className={styles.tickerGroup}>
              {tickerItems.map((title) => <span key={title}>{title}<i>✦</i></span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
