"use client";

import { useState, type FormEvent } from "react";

export function TrackingForm() {
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(
      reference.trim()
        ? "Order tracking will activate when the fulfilment provider is connected. This reference was not sent or stored."
        : "Enter an order reference to continue.",
    );
  };

  return (
    <form className="tracking-form" onSubmit={submit} noValidate>
      <label htmlFor="order-reference">Order reference</label>
      <input id="order-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="For example, NM-0000" required />
      <button className="button button--dark" type="submit">Track order <span aria-hidden="true">↗</span></button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

