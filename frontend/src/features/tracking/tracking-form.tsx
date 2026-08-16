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
    <form
      className="self-center bg-[var(--paper)] p-[35px] max-[680px]:px-5 max-[680px]:py-6"
      onSubmit={submit}
      noValidate
    >
      <label
        className="mb-2 block text-[0.61rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)]"
        htmlFor="order-reference"
      >
        Order reference
      </label>
      <input
        className="h-[54px] w-full border border-[var(--line)] bg-[var(--ivory)] px-[15px] outline-none"
        id="order-reference"
        value={reference}
        onChange={(event) => setReference(event.target.value)}
        placeholder="For example, NM-0000"
        required
      />
      <button
        className="mt-[15px] inline-flex min-h-[50px] w-full items-center justify-center gap-[22px] border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)]"
        type="submit"
      >
        Track order <span aria-hidden="true">↗</span>
      </button>
      {message && <p className="text-[0.72rem] text-[var(--muted)]" role="status">{message}</p>}
    </form>
  );
}
