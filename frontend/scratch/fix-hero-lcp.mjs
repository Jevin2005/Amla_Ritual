import fs from "fs";

const path = "src/widgets/home/product-hero.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  'loading="eager" className={styles.backgroundImage}',
  'priority className={styles.backgroundImage}'
);

content = content.replace(
  'loading="eager" fetchPriority="high" className={styles.posterImage}',
  'priority className={styles.posterImage}'
);

fs.writeFileSync(path, content, "utf8");
console.log("Updated product-hero.tsx with priority attributes");
