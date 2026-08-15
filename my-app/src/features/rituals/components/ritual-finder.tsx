"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RitualGoal } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/components/product-jar";
import { useStore } from "@/features/store/store-provider";
import {
  goalOptions,
  hairFeels,
  recommendRitual,
  type HairFeel,
} from "@/features/rituals/recommendation";

export function RitualFinder() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<RitualGoal | null>(null);
  const [hairFeel, setHairFeel] = useState<HairFeel | null>(null);
  const { addToCart, track } = useStore();
  const result = useMemo(
    () => (goal && hairFeel ? recommendRitual(goal, hairFeel) : null),
    [goal, hairFeel],
  );

  const finish = () => {
    if (!goal || !hairFeel) return;
    setStep(3);
    track("quiz_completed", { recommendation: recommendRitual(goal, hairFeel).slug });
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
