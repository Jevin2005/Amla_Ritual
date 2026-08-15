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
    <form className="newsletter-form" onSubmit={submit} noValidate>
      <label htmlFor="newsletter-email">Email address</label>
      <div>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby="newsletter-note"
          required
        />
        <button type="submit" aria-label="Join the NatureMist newsletter">
          ↗
        </button>
      </div>
      <p id="newsletter-note" role="status">
        {message || "No noise. Just thoughtful ritual notes."}
      </p>
    </form>
  );
}
