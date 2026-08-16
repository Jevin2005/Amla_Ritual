"use client";

import { useState, type FormEvent } from "react";
import { useStore } from "@/features/store/store-provider";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { track } = useStore();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }
    setMessage("Thank you. Sign-up is ready to connect; your email was not stored in this preview.");
    setEmail("");
    track("newsletter_signup", { status: "preview_validated" });
  };

  return (
    <form className="mt-7" onSubmit={submit} noValidate>
      <label
        className="mb-1.5 block text-[0.6rem] tracking-[0.12em] text-[rgba(255,255,255,0.72)] uppercase"
        htmlFor="newsletter-email"
      >
        Email address
      </label>
      <div className="grid grid-cols-[1fr_48px] border-b border-[rgba(255,255,255,0.65)]">
        <input
          className="h-[58px] border-0 bg-transparent text-[var(--paper)] outline-none placeholder:text-[rgba(255,255,255,0.36)]"
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby="newsletter-note"
          required
        />
        <button
          className="bg-transparent text-[1.4rem] text-[var(--amla)]"
          type="submit"
          aria-label="Join the NatureMist newsletter"
        >
          ↗
        </button>
      </div>
      <p
        className="mt-2 min-h-5 text-[0.64rem] text-[rgba(255,255,255,0.48)]"
        id="newsletter-note"
        role="status"
      >
        {message || "No noise. Just thoughtful ritual notes."}
      </p>
    </form>
  );
}
