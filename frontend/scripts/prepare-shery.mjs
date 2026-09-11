import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, copyFile } from "node:fs/promises";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const shery = dirname(require.resolve("sheryjs/package.json"));
const fromShery = createRequire(join(shery, "package.json"));
const output = join(root, "public/vendor/shery");
await mkdir(output, { recursive: true });
await Promise.all([
  ...["Shery.js", "Shery.css", "Shery.js.LICENSE.txt"].map((file) => copyFile(join(shery, "dist", file), join(output, file))),
  copyFile(join(dirname(fromShery.resolve("three")), "three.min.js"), join(output, "three.min.js")),
  copyFile(join(dirname(fromShery.resolve("three")), "../LICENSE"), join(output, "Three-LICENSE.txt")),
  copyFile(join(dirname(fromShery.resolve("controlkit")), "README.md"), join(output, "ControlKit-NOTICE.md")),
  copyFile(fromShery.resolve("gsap/dist/gsap.min.js"), join(output, "gsap.min.js")),
  build({ stdin: { contents: 'import ControlKit from "controlkit"; window.ControlKit = ControlKit;', resolveDir: shery }, bundle: true, minify: true, outfile: join(output, "controlkit.js"), platform: "browser", legalComments: "eof" }),
  build({ entryPoints: [join(root, "src/features/poster/shery-frame-runtime.ts")], bundle: true, minify: true, outfile: join(output, "runtime.js"), platform: "browser", target: "es2020" }),
]);
console.log("Prepared original Shery.js browser distribution and native ControlKit panel.");
