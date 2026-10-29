import type { AnalyticsConfig } from "./runtime";

/** Resolve once on the server; the script loader and event bridge share the same switches. */
export function resolveAnalyticsConfig(settings: {
  enabled?: string;
  shopifyEnabled?: string;
  gaId?: string;
  hosts?: string;
}): AnalyticsConfig {
  const hosts = [...new Set((settings.hosts || "").split(",")
    .map((host) => host.trim().toLowerCase())
    .filter((host) => /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)))];
  const enabled = settings.enabled === "true" && hosts.length > 0;
  return {
    enabled,
    shopifyEnabled: enabled && settings.shopifyEnabled === "true",
    gaId: enabled && /^G-[A-Z0-9]+$/.test(settings.gaId || "") ? settings.gaId! : "",
    hosts,
  };
}
