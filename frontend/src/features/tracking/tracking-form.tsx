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
      className="w-full max-w-[520px] self-center rounded-[var(--radius-lg)] bg-[var(--paper)] p-[35px] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] max-[900px]:max-w-none max-[680px]:rounded-[var(--radius-md)] max-[680px]:px-5 max-[680px]:py-6"
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
        className="h-[54px] w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ivory)] px-4 outline-none transition-colors focus:border-[var(--botanical)]"
        id="order-reference"
        value={reference}
        onChange={(event) => setReference(event.target.value)}
        placeholder="For example, NM-0000"
        required
      />
      <button
        className="mt-[15px] inline-flex min-h-[52px] w-full items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,color,border-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]"
        type="submit"
      >
        Track order <span aria-hidden="true">↗</span>
      </button>
      {message && <p className="text-[0.72rem] text-[var(--muted)]" role="status">{message}</p>}
    </form>
  );
}
