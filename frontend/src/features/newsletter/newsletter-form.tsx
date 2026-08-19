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
      <div className="grid grid-cols-[1fr_52px] overflow-hidden rounded-full border border-[rgba(255,255,255,0.3)] bg-white/6 p-1 focus-within:border-[var(--amla)] focus-within:ring-4 focus-within:ring-[rgba(183,212,90,0.12)]">
        <input
          className="h-[54px] rounded-full border-0 bg-transparent px-4 text-[var(--paper)] outline-none shadow-none placeholder:text-[rgba(255,255,255,0.5)] focus:shadow-none"
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby="newsletter-note"
          required
        />
        <button
          className="grid size-[52px] place-items-center rounded-full bg-[var(--amla)] text-[1.3rem] text-[var(--forest-dark)] transition-[transform,background-color] hover:scale-[1.03] hover:bg-[var(--paper)]"
          type="submit"
          aria-label="Join the NatureMist newsletter"
        >
          ↗
        </button>
      </div>
      <p
        className="mt-2 min-h-5 text-[0.68rem] text-[rgba(255,255,255,0.7)]"
        id="newsletter-note"
        role="status"
      >
        {message || "No noise. Just thoughtful ritual notes."}
      </p>
    </form>
  );
}
