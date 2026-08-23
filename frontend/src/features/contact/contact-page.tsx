"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useStore } from "@/features/store/store-provider";

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const buttonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-8 py-[14px] text-[0.72rem] leading-none font-bold tracking-[0.14em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]";
const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--paper)] px-5 py-3.5 text-[0.92rem] text-[var(--forest)] transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted)]/50 focus:border-[var(--forest)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--forest)]/10";

export function ContactPage() {
  const { track } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "ritual-guidance",
    orderNumber: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate support ticket submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      track("contact_form_submitted", { topic: formData.topic });
    }, 600);
  };

  return (
    <main className="overflow-x-clip" id="main-content">
      {/* Hero Header */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(183,212,90,0.15),transparent_40%),linear-gradient(180deg,#faf7f0,#f4efe4_70%,#f8f5ed)] px-[clamp(24px,5vw,72px)] pb-[clamp(50px,6vw,90px)] pt-[clamp(65px,8vw,110px)] text-center">
        <div className="mx-auto max-w-[820px]">
          <p className={eyebrowClass}>Direct Botanical Care & Support</p>
          <h1 className="m-0 font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[var(--forest)] text-balance">
            We are here to guide your ritual.
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[1.05rem] leading-[1.75] text-[var(--muted)]">
            Whether you need bespoke mixer recommendations, batch sourcing inquiries, or order care, our botanical specialists respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Grid: Contact Form + Channels */}
      <section className="mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,64px)] py-[clamp(60px,7vw,100px)]">
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-[clamp(40px,6vw,84px)] max-[920px]:grid-cols-1">
          {/* Form Container */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--paper)] p-[clamp(28px,4vw,52px)] shadow-[0_16px_45px_rgba(21,59,45,0.06)]">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <span className="mb-5 grid size-16 place-items-center rounded-full bg-[var(--forest)] text-2xl text-[var(--amla)]">
                  ✓
                </span>
                <h2 className="m-0 font-serif text-[2.2rem] font-normal text-[var(--forest)]">
                  Message received.
                </h2>
                <p className="mt-3 max-w-[400px] text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                  Thank you, <strong>{formData.name}</strong>. A dedicated botanical specialist will review your inquiry and email you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", topic: "ritual-guidance", orderNumber: "", message: "" });
                  }}
                  className={`${buttonClass} mt-8`}
                >
                  Send another note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                <div>
                  <h2 className="m-0 font-serif text-[clamp(1.8rem,3vw,2.4rem)] font-normal text-[var(--forest)]">
                    Send a note
                  </h2>
                  <p className="mt-2 text-[0.88rem] text-[var(--muted)]">
                    Fill out the details below and we will get back to you promptly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-[0.72rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase">
                      Your Name <span className="text-[var(--amla)]">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Priyanshu Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[0.72rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase">
                      Email Address <span className="text-[var(--amla)]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                  <div>
                    <label htmlFor="topic" className="mb-2 block text-[0.72rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase">
                      Topic <span className="text-[var(--amla)]">*</span>
                    </label>
                    <select
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="ritual-guidance">Ritual & Hair Routine Advice</option>
                      <option value="order-status">Order & Delivery Inquiry</option>
                      <option value="ingredient-purity">Ingredient & Lab Sourcing</option>
                      <option value="wholesale-press">Press & Wholesale Partnerships</option>
                      <option value="general">Other Inquiries</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="orderNumber" className="mb-2 block text-[0.72rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase">
                      Order ID (Optional)
                    </label>
                    <input
                      id="orderNumber"
                      type="text"
                      placeholder="e.g. #NM-1048"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-[0.72rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase">
                    How can we help? <span className="text-[var(--amla)]">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Describe your hair concerns, current routine, or question here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                  className={`${buttonClass} w-full justify-center disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isSubmitting ? "Sending note..." : "Send note to specialists"}
                </button>

                <p className="m-0 text-center text-[0.75rem] text-[var(--muted)]">
                  🔒 We respect your privacy and never share your consultation details.
                </p>
              </form>
            )}
          </div>

          {/* Direct Support Channels & Promise */}
          <div className="flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6">
              {/* Channel 1: Email */}
              <div className="group rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--botanical)]">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-[var(--sand)] text-xl text-[var(--forest)]">
                    ✉
                  </div>
                  <div>
                    <h3 className="m-0 font-serif text-[1.2rem] font-normal text-[var(--forest)]">
                      Care & Inquiries
                    </h3>
                    <a
                      href="mailto:care@naturemist.com"
                      className="text-[0.88rem] font-medium text-[var(--botanical)] underline underline-offset-4 hover:text-[var(--forest)]"
                    >
                      care@naturemist.com
                    </a>
                  </div>
                </div>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-[var(--muted)]">
                  Guaranteed response within 24 hours on all ritual consultations and customer care notes.
                </p>
              </div>

              {/* Channel 2: WhatsApp / Concierge */}
              <div className="group rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--botanical)]">
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-[var(--sand)] text-xl text-[var(--forest)]">
                    🌿
                  </div>
                  <div>
                    <h3 className="m-0 font-serif text-[1.2rem] font-normal text-[var(--forest)]">
                      Botanical Concierge
                    </h3>
                    <p className="m-0 text-[0.88rem] font-medium text-[var(--forest)]">
                      Mon – Sat · 9:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-[var(--muted)]">
                  Need an immediate answer about your hair type or mixing ratios? Check our instant FAQ guide or reach out.
                </p>
              </div>

              {/* Channel 3: Order Tracking */}
              <div className="group rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--botanical)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="m-0 font-serif text-[1.2rem] font-normal text-[var(--forest)]">
                      Looking for an Order?
                    </h3>
                    <p className="mt-1 text-[0.82rem] text-[var(--muted)]">
                      Track your dispatch status with real-time courier checkpoints.
                    </p>
                  </div>
                  <Link
                    href="/track-order"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--forest)] px-4 text-[0.7rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase transition-colors hover:bg-[var(--forest)] hover:text-white"
                  >
                    Track order →
                  </Link>
                </div>
              </div>
            </div>

            {/* Botanical Standards Badge */}
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--botanical)]/40 bg-[var(--sand)]/50 p-6 text-center">
              <span className="font-serif text-[1.15rem] italic text-[var(--forest)]">
                “Every botanical harvested at seasonal peak potency, batch-tested, and prepared in pure micro-batches.”
              </span>
              <p className="mt-2 text-[0.72rem] font-bold tracking-[0.14em] text-[var(--botanical)] uppercase">
                NatureMist Purity Standard
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
