"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MotionSettings } from "@/domain/motion";
import { botanicalProfiles, botanicalTopics, profilesForTopic, type BotanicalTopic } from "@/domain/catalog/botanical-uses";
import { installBenefitsPointer, observeBenefitsEntrance } from "./product-benefits-motion";
import styles from "./product-benefits.module.css";

function Leaf() {
  return <svg viewBox="0 0 20 24" fill="none" aria-hidden="true"><path d="M16.5 2.5C7 2.5 2.4 6.6 3.4 14.7c7.8 1.2 12.8-3.1 13.1-12.2Z" fill="currentColor" /><path d="M2.5 21C4 15 7.5 10.1 13.2 5.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="m5.3 14.1 7-7" stroke="#f7f2e4" strokeWidth=".7" /></svg>;
}

function Sprig() {
  return <svg viewBox="0 0 38 40" fill="none" aria-hidden="true"><path d="M9 36c9-10 10-18 20-31" stroke="currentColor" strokeWidth="1" /><path d="M20 21C8 23 5 18 3 13c8 0 13 2 17 8ZM23 16c-2-8 0-12 8-15 1 7-1 11-8 15ZM13 31c10 1 16-4 18-10-9 1-15 4-18 10Z" fill="currentColor" /><path d="m6 15 13 6M29 4l-5 10M16 29l12-6" stroke="#dce0ca" strokeWidth=".7" /></svg>;
}

export function ProductBenefits({ motionSettings }: { motionSettings: MotionSettings }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [topic, setTopic] = useState<BotanicalTopic>("all");
  const specimens = profilesForTopic(topic);
  const currentTopic = botanicalTopics.find((item) => item.value === topic)!;
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
  }, [motionSettings, topic]);

  return (
    <section ref={sectionRef} id="specimen-collection" className={styles.section} aria-labelledby="benefits-title" data-reveal-ignore>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.leafShadows} aria-hidden="true" />
      <div className={styles.foliage} aria-hidden="true"><span className={styles.topLeft} /><span className={styles.topRight} /><span className={styles.bottomLeft} /><span className={styles.bottomRight} /></div>
      <div className={styles.inner}>
        <header className={styles.header} data-benefit-reveal="header">
          <p className={styles.caption}><span>02 / The Specimen Collection</span></p>
          <h2 className={styles.heading} id="benefits-title">Know your herbs. <em>Explore their uses.</em></h2>
          <p className={styles.subtitle}>Hair care, colour and the wider world of botanical skin and body research.</p>
        </header>
        <div className={styles.topics} role="group" aria-label="Explore botanical uses">
          {botanicalTopics.map((item) => <button key={item.value} type="button" aria-pressed={topic === item.value} aria-controls="botanical-topic-cards" onClick={() => setTopic(item.value)}>{item.label}</button>)}
        </div>
        <p className={styles.topicDescription}>{currentTopic.description}</p>
        <p className={styles.topicCount} role="status">{specimens.length} {specimens.length === 1 ? "botanical" : "botanicals"} · {currentTopic.label}</p>
        <ol id="botanical-topic-cards" className={styles.cards} role="list" aria-label={currentTopic.label}>
          {specimens.map((specimen) => {
            const research = specimen.research.find((item) => item.topic === topic);
            return (
            <li key={specimen.image} className={styles.card} data-benefit-card data-benefit-reveal="card" data-botanical={specimen.image} data-research={Boolean(research)}>
              <div className={styles.paperShell} aria-hidden="true"><div className={styles.paper} /></div>
              <span className={styles.number} aria-hidden="true">{String(botanicalProfiles.indexOf(specimen) + 1).padStart(2, "0")}</span>
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
                <p className={styles.category}>{research ? research.label : specimen.category}</p>
                <h3 className={styles.name}>{specimen.name}</h3>
                {research ? <>
                  <p className={styles.researchSummary}>{research.summary}</p>
                  <p className={styles.note}>{research.limitation}</p>
                  <a className={styles.source} href={research.sourceUrl} target="_blank" rel="noopener noreferrer">{research.sourceTitle}<span className={styles.srOnly}> (opens in a new tab)</span> ↗</a>
                  <p className={styles.note}>Current product use: {specimen.category.toLowerCase()}.</p>
                </> : <ul className={styles.benefits} role="list">{specimen.roles.map((role) => <li key={role}><Leaf /><span>{role}</span></li>)}</ul>}
              </div>
            </li>
          ); })}
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
