import { matchesProductSlug } from "./catalog/canonical-slug";
import type { ComboCatalogEntry } from "./combo-catalog";

const artwork = [
  { members: ["amla-powder", "reetha-powder", "shikakai-powder"], image: "/images/botanical-combos/classic-trio.webp" },
  { members: ["amla-powder", "bhringraj-powder"], image: "/images/botanical-combos/botanical-duo.webp" },
  { members: ["amla-powder", "hibiscus-powder"], image: "/images/botanical-combos/floral-duo.webp" },
];
const knownMembers = [...new Set(artwork.flatMap((entry) => entry.members))];

/** Reuse local artwork only when it depicts every distinct jar in the pairing. */
export function getComboArtworkFallback({ products, count }: Pick<ComboCatalogEntry, "products" | "count">): string | undefined {
  if (!Number.isInteger(count) || count <= 0 || products.length !== count) return undefined;
  const identities = products.map((product) => knownMembers.filter((slug) => matchesProductSlug(slug, product)));
  if (identities.some((matches) => matches.length !== 1)) return undefined;
  const members = new Set(identities.map(([slug]) => slug));
  if (members.size !== count) return undefined;
  return artwork.find((entry) => entry.members.length === count && entry.members.every((slug) => members.has(slug)))?.image;
}
