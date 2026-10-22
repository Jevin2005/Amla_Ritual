"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MotionSettings } from "@/domain/motion";
import { installBenefitsPointer, observeBenefitsEntrance } from "./product-benefits-motion";
import styles from "./product-benefits.module.css";

const specimens = [
  { name: "Amla", image: "amla", alt: "Fresh green amla fruits with delicate leafy branches", benefits: ["Fruit-based hair packs", "Traditional botanical care", "Freshly prepared for each use"], note: "200 g · A botanical hair-pack ingredient." },
  { name: "Reetha", image: "reetha", alt: "Brown reetha soapnuts, an open shell and green leaves", benefits: ["Soapnut hair-wash ingredient", "Naturally occurring saponins", "A rinse-off cleansing routine"], note: "200 g · For herbal hair washes." },
  { name: "Shikakai", image: "shikakai", alt: "Dried shikakai pods with green compound leaves", benefits: ["Traditional hair washing", "A pod-based botanical", "A rinse-off cleansing step"], note: "200 g · For herbal hair washing." },
  { name: "Hibiscus", image: "hibiscus", alt: "A red hibiscus flower with its yellow stamen and green leaves", benefits: ["Floral hair-pack ingredient", "A separate step from washing", "Freshly prepared as directed"], note: "200 g · For botanical hair packs." },
  { name: "Bhringraj", image: "bhringraj", alt: "Bhringraj leaves and small white flowers", benefits: ["Traditional hair and scalp packs", "Ayurvedic hair-care heritage", "Prepare fresh as directed"], note: "200 g · A traditional hair-pack ritual." },
  { name: "Indigo", image: "indigo", alt: "Indigo leaves beside a wooden bowl of green botanical powder", benefits: ["Botanical hair-colour ingredient", "For a planned colour process", "Patch and strand-test as directed"], note: "200 g · Hair colour only. Results depend on the complete method." },
];

function Leaf() {
  return <svg viewBox="0 0 20 24" fill="none" aria-hidden="true"><path d="M16.5 2.5C7 2.5 2.4 6.6 3.4 14.7c7.8 1.2 12.8-3.1 13.1-12.2Z" fill="currentColor" /><path d="M2.5 21C4 15 7.5 10.1 13.2 5.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="m5.3 14.1 7-7" stroke="#f7f2e4" strokeWidth=".7" /></svg>;
}

function Sprig() {
  return <svg viewBox="0 0 38 40" fill="none" aria-hidden="true"><path d="M9 36c9-10 10-18 20-31" stroke="currentColor" strokeWidth="1" /><path d="M20 21C8 23 5 18 3 13c8 0 13 2 17 8ZM23 16c-2-8 0-12 8-15 1 7-1 11-8 15ZM13 31c10 1 16-4 18-10-9 1-15 4-18 10Z" fill="currentColor" /><path d="m6 15 13 6M29 4l-5 10M16 29l12-6" stroke="#dce0ca" strokeWidth=".7" /></svg>;
}

export function ProductBenefits({ motionSettings }: { motionSettings: MotionSettings }) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const stopEntrance = observeBenefitsEntrance(section, motionSettings);
    const stopPointer = installBenefitsPointer(section, motionSettings);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    let inView = false;
    const updateMotion = () => {
      const enabled = motionSettings.enabled && !reduced.matches;
      section.dataset.motionEnabled = String(enabled);
      section.dataset.motionRunning = String(enabled && desktop.matches && inView && !document.hidden);
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
    }) : undefined;
    if (observer) observer.observe(section);
    else inView = true;
    updateMotion();
    document.addEventListener("visibilitychange", updateMotion);
    reduced.addEventListener("change", updateMotion);
    desktop.addEventListener("change", updateMotion);
    return () => {
      stopEntrance(); stopPointer(); observer?.disconnect();
      document.removeEventListener("visibilitychange", updateMotion);
      reduced.removeEventListener("change", updateMotion);
      desktop.removeEventListener("change", updateMotion);
      delete section.dataset.motionEnabled;
      delete section.dataset.motionRunning;
    };
  }, [motionSettings]);

  return (
    <section ref={sectionRef} id="specimen-collection" className={styles.section} aria-labelledby="benefits-title" data-reveal-ignore>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.leafShadows} aria-hidden="true" />
      <div className={styles.foliage} aria-hidden="true"><span className={styles.topLeft} /><span className={styles.topRight} /><span className={styles.bottomLeft} /><span className={styles.bottomRight} /></div>
      <div className={styles.inner}>
        <header className={styles.header} data-benefit-reveal="header">
          <p className={styles.caption}><span>02 / The Specimen Collection</span></p>
          <h2 className={styles.heading} id="benefits-title">Know your herbs. <em>Find your care.</em></h2>
          <p className={styles.subtitle}>Six botanicals, three roles: traditional hair packs, herbal washes and plant-based hair colour.</p>
        </header>
        <ol className={styles.cards} role="list">
          {specimens.map((specimen, index) => (
            <li key={specimen.image} className={styles.card} data-benefit-card data-benefit-reveal="card" data-botanical={specimen.image}>
              <div className={styles.paperShell} aria-hidden="true"><div className={styles.paper} /></div>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.engraving} aria-hidden="true" />
              <div className={styles.art}>
                <div className={styles.contactShadow} aria-hidden="true" />
                <div className={styles.depth} data-benefit-depth><div className={styles.lift}>
                  <Image src={`/images/specimen-collection/${specimen.image}.webp`} alt={specimen.alt} fill
                    sizes="(max-width: 359px) 80px, (max-width: 767px) 30vw, (max-width: 1023px) 43vw, (max-width: 1440px) 29vw, 400px"
                    className={styles.botanical} quality={90} />
                </div></div>
              </div>
              <div className={styles.cardCopy}>
                <h3 className={styles.name}>{specimen.name}</h3>
                <ul className={styles.benefits} role="list">{specimen.benefits.map((benefit) => <li key={benefit}><Leaf /><span>{benefit}</span></li>)}</ul>
                {specimen.note && <p className={styles.note}>{specimen.note}</p>}
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.footer}>
          <span className={styles.ornament} aria-hidden="true"><Sprig /></span>
          <Link href="/shop" className={styles.button}><span>Explore the herbs</span><span className={styles.buttonArrow}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></Link>
          <span className={`${styles.ornament} ${styles.ornamentRight}`} aria-hidden="true"><Sprig /></span>
        </div>
      </div>
    </section>
  );
}
