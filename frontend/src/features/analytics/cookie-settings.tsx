"use client";

import { useState } from "react";

export function CookieSettings({ className }: { className?: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function openPreferences() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const banner = (window as Window & { privacyBanner?: { showPreferences: () => Promise<void> } }).privacyBanner;
      if (!banner) throw new Error("Privacy controls unavailable");
      await banner.showPreferences();
    } catch {
      setMessage("Cookie settings could not load. Please refresh and try again.");
    } finally { setBusy(false); }
  }
  return <>
    <button type="button" className={className} disabled={busy} onClick={() => void openPreferences()}>
      {busy ? "Opening cookie settings…" : "Cookie settings"}
    </button>
    {message && <span role="status" className="mt-1 max-w-56 text-xs text-white/76">{message}</span>}
  </>;
}
