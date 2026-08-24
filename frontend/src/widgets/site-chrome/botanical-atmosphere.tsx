import styles from "./botanical-atmosphere.module.css";

const leafClasses = [
  styles.leafOne,
  styles.leafTwo,
  styles.leafThree,
  styles.leafFour,
  styles.leafFive,
  styles.leafSix,
  styles.leafSeven,
  styles.leafEight,
  styles.leafNine,
  styles.leafTen,
  styles.leafEleven,
  styles.leafTwelve,
];

export function BotanicalAtmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <span className={`${styles.halo} ${styles.haloNorth}`} />
      <span className={`${styles.halo} ${styles.haloSouth}`} />
      {leafClasses.map((leafClass) => (
        <span className={`${styles.leaf} ${leafClass}`} key={leafClass}>
          <i className={styles.blade} />
        </span>
      ))}
    </div>
  );
}
