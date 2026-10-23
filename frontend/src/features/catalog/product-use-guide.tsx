import type { Product } from "@/domain/catalog/products";
import { getBotanicalProfile } from "@/domain/catalog/botanical-uses";
import styles from "./product-use-guide.module.css";

export function ProductUseGuide({ product }: { product: Product }) {
  const profile = getBotanicalProfile(product);
  if (!profile) return null;

  return <section className={styles.guide} aria-labelledby="product-use-title">
    <p className={styles.eyebrow}>Product use</p>
    <h2 id="product-use-title">{profile.category}</h2>
    <p>Prepare this jar using its label directions. {profile.topic === "colour" ? "Indigo is for scalp-hair colouring." : "Use it as part of your hair-care routine."}</p>
    {profile.research.length > 0 && <details>
      <summary>Explore skin &amp; body traditions and research</summary>
      <p>These references describe traditional associations or other preparations. They do not establish face or body application directions for this jar.</p>
      {profile.research.map((item) => <div className={styles.research} key={item.topic}>
        <h3>{item.label}</h3>
        <p>{item.summary}</p>
        <p>{item.limitation}</p>
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceTitle}<span className={styles.srOnly}> (opens in a new tab)</span> ↗</a>
      </div>)}
    </details>}
  </section>;
}
