import fs from "fs";

const path = "src/features/catalog/product-gallery.tsx";
let content = fs.readFileSync(path, "utf8");
content = content.replace('loading="eager"', 'priority={selectedIndex === 0}');
fs.writeFileSync(path, content, "utf8");
console.log("Updated product-gallery.tsx with priority");
