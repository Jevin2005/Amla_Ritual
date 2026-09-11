import type { StoreImage } from "@/domain/catalog/products";
import type { SheryConfig } from "@/domain/shery-config";

export function sheryFrameDocument(images: StoreImage[], config: SheryConfig, debug: boolean) {
  const data = JSON.stringify({ images, config, debug }).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/vendor/shery/Shery.css">
    <style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}
    #poster{position:absolute;inset:0;width:100%;height:100%;cursor:pointer}canvas{cursor:pointer}#poster img{display:block;width:100%;height:100%;object-fit:cover}
    body.debug{background:#f4f1e8}body.debug #poster{inset:24px auto auto 344px;width:min(480px,calc(100vw - 368px),calc((100vh - 48px)*.72));height:auto;aspect-ratio:.72}
    #controlKit .panel{max-width:calc(100vw - 24px)}
    @media(max-width:680px){body.debug #poster{inset:55% 12px 12px;width:calc(100% - 24px);height:calc(45% - 12px)}}
    #error{position:relative;z-index:10;padding:20px;font:14px/1.5 sans-serif;color:#183f2e;background:#f4f1e8}
    </style></head><body${debug ? ' class="debug"' : ""}><div id="poster"></div><p id="error" hidden></p>
    <script id="shery-data" type="application/json">${data}</script><script src="/vendor/shery/runtime.js"></script></body></html>`;
}
