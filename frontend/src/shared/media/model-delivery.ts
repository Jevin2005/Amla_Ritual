import assets from "./model-assets.json";

// Match the original file exactly so a new model selected in the catalog is
// never silently replaced by an older bundled jar.
export function optimizedModelUrl(source: string): string {
  return assets.find((asset) => asset.source === source)?.path ?? source;
}
