import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NatureMist Botanical Rituals",
    short_name: "NatureMist",
    description: "Traditional botanical powders for hair packs, herbal washing and plant-based hair colour.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4e8",
    theme_color: "#173f2a",
  };
}

