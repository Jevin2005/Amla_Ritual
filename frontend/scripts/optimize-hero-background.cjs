// Run from any directory: node frontend/scripts/optimize-hero-background.cjs
// Keep the original artwork; regenerate delivery assets when it changes.
/* eslint-disable @typescript-eslint/no-require-imports -- Use Sharp's CommonJS native entrypoint for Windows build tooling. */
const sharp = require("sharp");
const path = require("node:path");

async function main() {
  const directory = path.join(__dirname, "../public/images/hero");
  const source = path.join(directory, "naturemist-botanical-shadows.png");
  for (const [name, width] of [
    ["naturemist-botanical-shadows.webp", 1600],
    ["naturemist-botanical-shadows-mobile.webp", 900],
  ]) {
    const result = await sharp(source).resize({ width, withoutEnlargement: true })
      .webp({ quality: 75, alphaQuality: 80, effort: 6 })
      .toFile(path.join(directory, name));
    console.log(`${name}: ${result.width} x ${result.height}, ${result.size} bytes`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
