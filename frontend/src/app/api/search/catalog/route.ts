import { getSearchCatalog } from "@/lib/shopify/storefront";
import { toSearchProduct } from "@/domain/catalog/search";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = (await getSearchCatalog()).map(toSearchProduct);
    return Response.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The latest catalog could not be loaded." }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
