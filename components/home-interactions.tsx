"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  bundles,
  formatCurrency,
  getBundleProducts,
  getProduct,
  products,
  type RitualGoal,
} from "@/lib/products";
import { ProductJar } from "@/components/product-jar";
import { useStore } from "@/components/store-provider";

export function HeroPurchase() {
  const amla = products[0];
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const add = () => {
    addToCart(amla.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="hero-purchase">
      <div className="hero-price-row">
        <span>{formatCurrency(amla.pricePaise)}</span>
        <small>Preview price · final pack details pending</small>
      </div>
      <div className="hero-actions">
        <button className="button button--dark" type="button" onClick={add}>
          {added ? "Added to your ritual" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
        <a className="button button--ghost" href="#amla-ritual">
          Explore the ritual
        </a>
      </div>
    </div>
  );
}

export function FeaturedProductSwitcher() {
  const [activeSlug, setActiveSlug] = useState(products[0].slug);
  const { addToCart } = useStore();
  const product = getProduct(activeSlug) ?? products[0];

  return (
    <div
      className="family-switcher"
      style={{
        "--family-accent": product.accent,
        "--family-soft": product.accentSoft,
      } as React.CSSProperties}
    >
      <div className="family-switcher__tabs" role="tablist" aria-label="Choose a botanical">
        {products.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={item.slug === product.slug}
            className={item.slug === product.slug ? "is-active" : ""}
            onClick={() => setActiveSlug(item.slug)}
          >
            <span>{item.collectionNumber}</span>
            {item.name.replace(" Powder", "")}
          </button>
        ))}
      </div>
      <div className="family-switcher__stage" role="tabpanel">
        <span className="family-switcher__ring" aria-hidden="true" />
        <ProductJar key={product.slug} product={product} size="large" />
      </div>
      <div className="family-switcher__copy">
        <p className="eyebrow">Ritual {product.collectionNumber}</p>
        <h3>{product.name}</h3>
        <p className="lead">{product.shortDescription}</p>
        <ul className="mini-benefits">
          {product.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <div className="family-switcher__actions">
          <Link className="text-link" href={`/shop/${product.slug}`}>
            View the ritual <span aria-hidden="true">↗</span>
          </Link>
          <button className="round-add round-add--dark" type="button" onClick={() => addToCart(product.slug)}>
            <span className="sr-only">Add {product.name} to bag</span>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const goalOptions: Array<{ goal: RitualGoal; number: string; copy: string }> = [
  { goal: "Cleanse", number: "01", copy: "A low-lather wash-day reset" },
  { goal: "Softness + Shine", number: "02", copy: "A conditioning mask for luminous lengths" },
  { goal: "Scalp Ritual", number: "03", copy: "Grounding care from scalp through ends" },
  { goal: "Botanical Colour", number: "04", copy: "Informed, carefully strand-tested colour" },
];

const hairFeels = ["Oily", "Balanced", "Dry / textured", "Very light / coloured"] as const;

function recommend(goal: RitualGoal, hairFeel: (typeof hairFeels)[number]) {
  if (goal === "Botanical Colour") return getProduct("indigo-powder")!;
  if (goal === "Scalp Ritual") return getProduct("bhringraj-powder")!;
  if (goal === "Cleanse") {
    return hairFeel === "Oily" ? getProduct("reetha-powder")! : getProduct("shikakai-powder")!;
  }
  return hairFeel === "Dry / textured"
    ? getProduct("hibiscus-powder")!
    : getProduct("amla-powder")!;
}

export function RitualFinder() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<RitualGoal | null>(null);
  const [hairFeel, setHairFeel] = useState<(typeof hairFeels)[number] | null>(null);
  const { addToCart, track } = useStore();
  const result = useMemo(
    () => (goal && hairFeel ? recommend(goal, hairFeel) : null),
    [goal, hairFeel],
  );

  const finish = () => {
    if (!goal || !hairFeel) return;
    setStep(3);
    track("quiz_completed", { recommendation: recommend(goal, hairFeel).slug });
  };

  const reset = () => {
    setGoal(null);
    setHairFeel(null);
    setStep(1);
  };

  return (
    <div className="ritual-finder">
      <div className="ritual-finder__progress" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((number) => (
          <span key={number} className={step >= number ? "is-active" : ""} />
        ))}
      </div>
      {step === 1 && (
        <fieldset className="ritual-finder__step">
          <legend>
            <span>01</span>
            What would you like your ritual to focus on?
          </legend>
          <div className="ritual-options">
            {goalOptions.map((option) => (
              <label key={option.goal} className={goal === option.goal ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="ritual-goal"
                  value={option.goal}
                  checked={goal === option.goal}
                  onChange={() => setGoal(option.goal)}
                />
                <span className="ritual-options__number">{option.number}</span>
                <strong>{option.goal}</strong>
                <small>{option.copy}</small>
                <span className="ritual-options__check" aria-hidden="true">○</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="button button--light"
            disabled={!goal}
            onClick={() => setStep(2)}
          >
            Continue <span aria-hidden="true">→</span>
          </button>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="ritual-finder__step">
          <legend>
            <span>02</span>
            How do your hair and lengths feel today?
          </legend>
          <div className="hair-feel-options">
            {hairFeels.map((option) => (
              <label key={option} className={hairFeel === option ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="hair-feel"
                  value={option}
                  checked={hairFeel === option}
                  onChange={() => setHairFeel(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <div className="ritual-finder__buttons">
            <button type="button" className="button button--ghost-light" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="button button--light" disabled={!hairFeel} onClick={finish}>
              Reveal my ritual <span aria-hidden="true">→</span>
            </button>
          </div>
        </fieldset>
      )}

      {step === 3 && result && (
        <div className="ritual-result" aria-live="polite">
          <div className="ritual-result__visual">
            <ProductJar product={result} size="large" decorative />
          </div>
          <div className="ritual-result__copy">
            <p className="eyebrow eyebrow--light">Your starting ritual</p>
            <h3>{result.name}</h3>
            <p>{result.shortDescription}</p>
            <p className="ritual-result__safety">
              This is cosmetic guidance, not a diagnosis. Always read the final pack directions and patch test.
            </p>
            <div className="ritual-result__buttons">
              <button className="button button--light" type="button" onClick={() => addToCart(result.slug)}>
                Add to bag <span aria-hidden="true">↗</span>
              </button>
              <Link className="text-link text-link--light" href={`/shop/${result.slug}`}>
                Read the ritual
              </Link>
            </div>
            <button className="reset-link" type="button" onClick={reset}>
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BundleCards() {
  const { addManyToCart } = useStore();

  return (
    <div className="bundle-grid">
      {bundles.map((bundle, index) => {
        const bundleProducts = getBundleProducts(bundle.slugs);
        const total = bundleProducts.reduce((sum, product) => sum + product.pricePaise, 0);
        return (
          <article className={`bundle-card bundle-card--${index + 1}`} key={bundle.id}>
            <div className="bundle-card__jars" aria-hidden="true">
              {bundleProducts.slice(0, 4).map((product) => (
                <ProductJar key={product.slug} product={product} size="small" decorative />
              ))}
              {bundleProducts.length > 4 && <span className="bundle-card__more">+{bundleProducts.length - 4}</span>}
            </div>
            <div className="bundle-card__copy">
              <p className="eyebrow">Ritual set {String(index + 1).padStart(2, "0")}</p>
              <h3>{bundle.name}</h3>
              <p>{bundle.description}</p>
              <div>
                <span>{formatCurrency(total)}</span>
                <small>Combined preview price</small>
              </div>
              <button className="button button--dark" type="button" onClick={() => addManyToCart(bundle.slugs)}>
                Add the ritual <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

