import type { StoreImage } from "@/domain/catalog/products";
import type { SheryConfig } from "@/domain/shery-config";

export function sheryBackgroundDocument(images: StoreImage[], config: SheryConfig) {
  const data = JSON.stringify({ images, config, debug: false }).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/vendor/shery/Shery.css">
    <style>
      *{box-sizing:border-box}
      html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}
      #background{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      canvas{pointer-events:none;width:100% !important;height:100% !important;object-fit:cover}
      #background img{display:none}
      #error{position:relative;z-index:10;padding:20px;font:14px/1.5 sans-serif;color:#183f2e;background:#f4f1e8}
    </style></head><body><div id="background"></div><p id="error" hidden></p>
    <script id="shery-data" type="application/json">${data}</script><script src="/vendor/shery/background-runtime.js"></script></body></html>`;
}
