"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import { useStore } from "@/features/store/store-provider";
import { SUPPORT_MESSAGE } from "@/shared/config/support";
import { scrollPageTo } from "@/shared/ui/page-scroll";
import { calculateCartBilling, formatBillingCurrency } from "@/domain/cart/billing";
import { hasCheckoutCartChanged } from "./checkout-cart";

export type CheckoutFormData = {
  email: string;
  phone: string;
  newsletter: boolean;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  saveAddress: boolean;
  shippingMethod: "standard" | "express";
  paymentMethod: "shopify" | "cod" | "upi";
  upiId?: string;
};

export type OrderConfirmationData = {
  shopifySyncPending?: boolean;
  paymentReference?: string;
  orderId: string;
  placedAt: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  subtotalPaise: number;
  discountPaise: number;
  shippingFeePaise: number;
  totalPaise: number;
  currencyCode: string;
  items: Array<{
    name: string;
    variant: string;
    quantity: number;
    pricePaise: number;
    slug: string;
  }>;
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

type CheckoutFormProps = {
  onOrderSuccess: (order: OrderConfirmationData) => void;
  shippingFeePaise: number;
  onShippingChange: (feePaise: number) => void;
};

export function CheckoutForm({
  onOrderSuccess,
  shippingFeePaise,
  onShippingChange,
}: CheckoutFormProps) {
  const {
    source,
    cart,
    subtotalPaise,
    totalPaise,
    discountAmountPaise,
    currencyCode,
    updateBuyerIdentity,
    clearCart,
    track,
    isCartBusy,
  } = useStore();

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    phone: "",
    newsletter: true,
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "Maharashtra",
    zip: "",
    country: "India",
    saveAddress: true,
    shippingMethod: "standard",
    paymentMethod: "shopify",
    upiId: "",
  });

  const isCodEnabled = process.env.NEXT_PUBLIC_ENABLE_COD === "true";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const billing = calculateCartBilling({ items: cart, totalPaise, discountAmountPaise, shippingFeePaise });
  const finalTotalPaise = billing.totalPaise;
  const finalPayableAmount = formatBillingCurrency(finalTotalPaise, currencyCode);

  const handleInputChange = (
    field: keyof CheckoutFormData,
    value: string | boolean,
  ) => {
    setErrorMessage("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (method: "standard" | "express") => {
    handleInputChange("shippingMethod", method);
    onShippingChange(method === "express" ? 14900 : 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isCartBusy || !cart.length) return;
    setErrorMessage("");

    const errors: Record<string, string> = {};

    // 1. Email validation
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = "Email address is required for order confirmation.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    // 2. Phone validation
    const digitsOnlyPhone = formData.phone.replace(/\D/g, "");
    if (!digitsOnlyPhone) {
      errors.phone = "Mobile number is required for dispatch & tracking updates.";
    } else if (digitsOnlyPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // 3. First Name
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    // 4. Last Name
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }

    // 5. Address Line 1
    if (!formData.address1.trim()) {
      errors.address1 = "House number, building, and street address are required.";
    }

    // 6. City
    if (!formData.city.trim()) {
      errors.city = "City is required.";
    }

    // 7. PIN Code
    const trimmedZip = formData.zip.trim();
    if (!trimmedZip) {
      errors.zip = "6-digit PIN code is required.";
    } else if (!/^\d{6}$/.test(trimmedZip)) {
      errors.zip = "Please enter a valid 6-digit Indian PIN code.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete the required details highlighted in red below.");

      // Scroll smoothly to the first invalid field
      const fieldIdMap: Record<string, string> = {
        email: "checkout-email",
        phone: "checkout-phone",
        firstName: "checkout-first-name",
        lastName: "checkout-last-name",
        address1: "checkout-address1",
        city: "checkout-city",
        zip: "checkout-zip",
      };

      const firstInvalidField = Object.keys(errors)[0];
      const targetId = fieldIdMap[firstInvalidField];
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.focus({ preventScroll: true });
          scrollPageTo(el, { block: "center" });
        }
      }
      return;
    }

    setIsSubmitting(true);
    let paymentOpened = false;

    try {
      // Refresh the cart before payment, since the delivery address can affect billing.
      if (source === "shopify") {
        const refreshedCart = await updateBuyerIdentity({
          email: formData.email.trim(),
          phone: `+91${digitsOnlyPhone.slice(-10)}`,
          countryCode: "IN",
          deliveryAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            address1: formData.address1.trim(),
            address2: formData.address2.trim(),
            city: formData.city.trim(),
            province: formData.province.trim(),
            zip: formData.zip.trim(),
            country: "IN",
          },
        });
        if (!refreshedCart) {
          throw new Error("We could not confirm your latest bag total. Please try again before paying.");
        }
        if (hasCheckoutCartChanged(
          { items: cart, subtotalPaise, totalPaise, discountAmountPaise, currencyCode },
          refreshedCart,
        )) {
          throw new Error("Your bag or total changed after confirming your delivery details. Please review the updated order summary, then place your order again.");
        }
      }

      // ── IN-APP DIRECT PAYMENT (RAZORPAY MODAL: UPI, QR, CARDS, NET BANKING & WALLETS) ──
      const isCodPayment = isCodEnabled && formData.paymentMethod === "cod";
      if (!Number.isSafeInteger(finalTotalPaise) || finalTotalPaise < 0) {
        throw new Error("Your bag total could not be confirmed. Please refresh your bag and try again.");
      }
      if (!isCodPayment && finalTotalPaise < 100) {
        throw new Error(`Online payment requires a minimum total of ${formatBillingCurrency(100, currencyCode)}. Please update your bag${isCodEnabled ? " or choose Cash on Delivery" : ""} to continue.`);
      }
      if (!isCodPayment) {
        // Function to load Razorpay Checkout.js dynamically if not already available
        const loadScript = (): Promise<boolean> => {
          return new Promise((resolve) => {
            if (typeof window === "undefined") return resolve(false);
            if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        try {
          const cleanPhone = digitsOnlyPhone.length >= 10 ? digitsOnlyPhone.slice(-10) : digitsOnlyPhone;

          // 1. Server-Side Secure Order Initialization (Locks price & creates authentic order_id)
          const createOrderRes = await fetch("/api/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amountPaise: finalTotalPaise,
              currency: currencyCode || "INR",
              notes: {
                customer: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
                email: formData.email.trim(),
                phone: `+91${cleanPhone}`,
                payment_type: "RAZORPAY_ONLINE",
              },
            }),
          });

          const createOrderData = await createOrderRes.json();
          if (!createOrderRes.ok || !createOrderData?.orderId) {
            throw new Error(
              createOrderData?.error || "Failed to initialize secure payment order. Please try again.",
            );
          }
          if (createOrderData.amountPaise !== finalTotalPaise || createOrderData.currency !== (currencyCode || "INR")) {
            throw new Error("The payment amount does not match your order summary. Please refresh your bag and try again.");
          }

          const isLoaded = await loadScript();
          const RazorpayConstructor = (window as unknown as {
            Razorpay?: new (opts: unknown) => { open: () => void; on: (event: string, cb: unknown) => void };
          }).Razorpay;

          if (!isLoaded || !RazorpayConstructor) {
            setErrorMessage("Failed to load Razorpay payment gateway. Please check your internet connection and try again.");
            setIsSubmitting(false);
            return;
          }

          const rzpPrefill: Record<string, string> = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            email: formData.email.trim(),
            contact: cleanPhone,
          };

          const rzpOptions: Record<string, unknown> = {
            key: createOrderData.keyId,
            order_id: createOrderData.orderId,
            amount: createOrderData.amountPaise,
            currency: createOrderData.currency || "INR",
            name: "NatureMist Botanicals",
            description: "NatureMist Botanical Ritual Order",
            prefill: rzpPrefill,
            notes: {
              address: `${formData.address1.trim()}, ${formData.city.trim()}, ${formData.province.trim()} - ${formData.zip.trim()}`,
              payment_method: "RAZORPAY_ONLINE",
            },
            theme: {
              color: "#153b2d",
            },
            modal: {
              ondismiss: () => {
                setIsSubmitting(false);
              },
            },
          };

          const rzp = new RazorpayConstructor({
            ...rzpOptions,
            handler: async (response: {
              razorpay_payment_id?: string;
              razorpay_order_id?: string;
              razorpay_signature?: string;
            }) => {
              try {
                if (!response.razorpay_payment_id || !response.razorpay_signature) {
                  throw new Error("Missing payment credentials from gateway.");
                }

                // 2. Cryptographic Signature Verification on Server
                const verifyRes = await fetch("/api/razorpay/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id || createOrderData.orderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });

                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData?.verified) {
                  throw new Error(verifyData?.error || "Payment signature verification failed.");
                }

                // 3. Submit verified paid order directly to Shopify Admin API
                let shopifySynced = false;
                let finalOrderId = `NMR-RZP-${response.razorpay_payment_id?.slice(-6) || Math.floor(10000 + Math.random() * 90000)}`;
                let finalPlacedAt = new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                try {
                  const orderRes = await fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      customer: {
                        firstName: formData.firstName.trim(),
                        lastName: formData.lastName.trim(),
                        email: formData.email.trim(),
                        phone: `+91${cleanPhone}`,
                      },
                      deliveryAddress: {
                        firstName: formData.firstName.trim(),
                        lastName: formData.lastName.trim(),
                        address1: formData.address1.trim(),
                        address2: formData.address2.trim(),
                        city: formData.city.trim(),
                        province: formData.province.trim(),
                        zip: formData.zip.trim(),
                        country: "India",
                      },
                      items: cart.map((item) => ({
                        name: item.productName,
                        variant: item.variantTitle,
                        quantity: item.quantity,
                        pricePaise: item.lineTotalPaise,
                        slug: item.slug,
                        variantId: item.variantId || null,
                        imageUrl: item.image?.url || null,
                      })),
                      paymentMethod: "shopify",
                      shippingMethod: formData.shippingMethod,
                      shippingFeePaise,
                      totalPaise: finalTotalPaise,
                      currencyCode,
                      newsletter: formData.newsletter,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpayOrderId: response.razorpay_order_id || createOrderData.orderId,
                      razorpaySignature: response.razorpay_signature,
                    }),
                  });

                  if (orderRes.ok) {
                    const resData = await orderRes.json();
                    shopifySynced = resData.success === true && resData.shopifyOrderCreated === true;
                    if (resData?.orderId) {
                      finalOrderId = resData.orderId;
                    }
                    if (resData?.placedAt) {
                      finalPlacedAt = resData.placedAt;
                    }
                  }
                } catch (syncErr) {
                  console.warn("Order sync note:", syncErr);
                }

                // 4. Track purchase event
                track("purchase", {
                  value: finalTotalPaise / 100,
                  currency: currencyCode,
                  payment_type: "razorpay_online",
                  transaction_id: response.razorpay_payment_id,
                  items_count: cart.reduce((t, i) => t + i.quantity, 0),
                });

                const confirmation: OrderConfirmationData = {
                  shopifySyncPending: !shopifySynced,
                  paymentReference: response.razorpay_payment_id,
                  orderId: finalOrderId,
                  placedAt: finalPlacedAt,
                  customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                  shippingAddress: `${formData.address1.trim()}${
                    formData.address2.trim() ? `, ${formData.address2.trim()}` : ""
                  }, ${formData.city.trim()}, ${formData.province.trim()} - ${formData.zip.trim()}, India`,
                  shippingMethod:
                    formData.shippingMethod === "express"
                      ? "Express Priority Air Delivery (1-2 Days)"
                      : "Standard Ayurvedic Delivery (3-5 Days · Free)",
                  paymentMethod: `Paid Online via Razorpay (Ref: ${response.razorpay_payment_id || "Verified"})`,
                  subtotalPaise: billing.merchandiseSubtotalPaise,
                  discountPaise: billing.discountPaise,
                  shippingFeePaise: billing.shippingFeePaise,
                  totalPaise: finalTotalPaise,
                  currencyCode,
                  items: cart.map((item) => ({
                    name: item.productName,
                    variant: item.variantTitle,
                    quantity: item.quantity,
                    pricePaise: item.lineSubtotalPaise,
                    slug: item.slug,
                  })),
                };

                if (shopifySynced) await clearCart();
                onOrderSuccess(confirmation);
                setIsSubmitting(false);
              } catch (handlerErr) {
                console.error("Payment processing handler error:", handlerErr);
                setErrorMessage(
                  handlerErr instanceof Error
                    ? handlerErr.message
                    : `Payment verified but failed to record order. ${SUPPORT_MESSAGE}`,
                );
                setIsSubmitting(false);
              }
            },
          });

          rzp.on("payment.failed", (errResponse: { error?: { description?: string; reason?: string } }) => {
            console.warn("Razorpay payment failed:", errResponse);
            setErrorMessage(
              errResponse?.error?.description || "Payment failed. Please try a different bank or payment method.",
            );
            setIsSubmitting(false);
          });

          paymentOpened = true;
          rzp.open();
          return;
        } catch (rzpErr: unknown) {
          console.error("Razorpay initialization error:", rzpErr);
          setErrorMessage(
            rzpErr instanceof Error ? rzpErr.message : "Failed to open Razorpay payment gateway.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Submit order to /api/shopify/order (for COD when explicitly enabled)
      if (!isCodEnabled) {
        setErrorMessage("Cash on Delivery is currently disabled. Please pay online via UPI, Cards, or Net Banking.");
        setIsSubmitting(false);
        return;
      }

      let finalOrderId = `NMR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      let finalPlacedAt = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      try {
        const orderRes = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              email: formData.email.trim(),
              phone: `+91${digitsOnlyPhone.slice(-10)}`,
            },
            deliveryAddress: {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              address1: formData.address1.trim(),
              address2: formData.address2.trim(),
              city: formData.city.trim(),
              province: formData.province.trim(),
              zip: formData.zip.trim(),
              country: "India",
            },
            items: cart.map((item) => ({
              name: item.productName,
              variant: item.variantTitle,
              quantity: item.quantity,
              pricePaise: item.lineTotalPaise,
              slug: item.slug,
              variantId: item.variantId || null,
              imageUrl: item.image?.url || null,
            })),
            paymentMethod: formData.paymentMethod,
            upiId: formData.upiId?.trim() || undefined,
            shippingMethod: formData.shippingMethod,
            shippingFeePaise,
            totalPaise: finalTotalPaise,
            currencyCode,
            newsletter: formData.newsletter,
          }),
        });

        const resData = await orderRes.json();
        if (!orderRes.ok || !resData.success || !resData.shopifyOrderCreated) {
          throw new Error(resData.error || `Order could not be saved. ${SUPPORT_MESSAGE}`);
        }
        if (orderRes.ok) {
          if (resData?.orderId) {
            finalOrderId = resData.orderId;
          }
          if (resData?.placedAt) {
            finalPlacedAt = resData.placedAt;
          }
        }
      } catch (orderApiErr) {
        console.warn("Order endpoint note:", orderApiErr);
        setErrorMessage(orderApiErr instanceof Error ? orderApiErr.message : "Unable to save your order.");
        setIsSubmitting(false);
        return;
      }

      // Track purchase event
      track("purchase", {
        value: finalTotalPaise / 100,
        currency: currencyCode,
        payment_type: formData.paymentMethod,
        items_count: cart.reduce((t, i) => t + i.quantity, 0),
      });

      const paymentLabel =
        formData.paymentMethod === "cod"
          ? "Cash on Delivery (Pay at Doorstep)"
          : "Paid Online via Razorpay";

      const confirmation: OrderConfirmationData = {
        orderId: finalOrderId,
        placedAt: finalPlacedAt,
        customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        shippingAddress: `${formData.address1.trim()}${
          formData.address2.trim() ? `, ${formData.address2.trim()}` : ""
        }, ${formData.city.trim()}, ${formData.province.trim()} - ${formData.zip.trim()}, India`,
        shippingMethod:
          formData.shippingMethod === "express"
            ? "Express Priority Air Delivery (1-2 Days)"
            : "Standard Ayurvedic Delivery (3-5 Days · Free)",
        paymentMethod: paymentLabel,
        subtotalPaise: billing.merchandiseSubtotalPaise,
        discountPaise: billing.discountPaise,
        shippingFeePaise: billing.shippingFeePaise,
        totalPaise: finalTotalPaise,
        currencyCode,
        items: cart.map((item) => ({
          name: item.productName,
          variant: item.variantTitle,
          quantity: item.quantity,
          pricePaise: item.lineSubtotalPaise,
          slug: item.slug,
        })),
      };

      // Clear the cart in store
      await clearCart();

      // Trigger success screen
      onOrderSuccess(confirmation);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to process checkout. Please verify your details and try again.",
      );
    } finally {
      if (!paymentOpened) setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {/* ── Main Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
        <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-7">
        {/* Error Alert */}
        {errorMessage && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-[#dfb7ad] bg-[#f7e9e4] p-3.5 text-[0.76rem] font-medium text-[#813c2f]"
            role="alert"
          >
            <span className="text-base font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Step 1: Contact Information ── */}
        <section id="checkout-contact-section" className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--forest)] text-[0.68rem] font-bold text-white">
              1
            </span>
            <h3 className="font-serif text-[1.25rem] font-normal text-[var(--forest)]">
              Contact Information
            </h3>
          </div>

          <div className="grid gap-3">
            <div>
              <label
                htmlFor="checkout-email"
                className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                  fieldErrors.email
                    ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                    : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                }`}
              />
              {fieldErrors.email ? (
                <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                  ⚠️ {fieldErrors.email}
                </p>
              ) : (
                <p className="mt-1 text-[0.62rem] text-[var(--muted)]">
                  We’ll send order tracking and the botanical preparation guide here.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
              >
                Phone Number (WhatsApp / SMS) <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex rounded-xl border bg-[var(--paper)] overflow-hidden transition-all ${
                  fieldErrors.phone
                    ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                    : "border-[var(--line)] focus-within:border-[var(--botanical)] focus-within:ring-2 focus-within:ring-[var(--botanical)]/15"
                }`}
              >
                <span className="flex items-center bg-[var(--ivory)] px-3 text-[0.76rem] font-bold text-[var(--forest)] border-r border-[var(--line)]">
                  🇮🇳 +91
                </span>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Your 10-digit mobile number"
                  className="h-11 flex-1 bg-transparent px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                  ⚠️ {fieldErrors.phone}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) => handleInputChange("newsletter", e.target.checked)}
                className="size-4 rounded border-[var(--line)] text-[var(--forest)] accent-[var(--forest)]"
              />
              <span className="text-[0.72rem] text-[var(--muted)]">
                Keep me updated on fresh botanical batches and seasonal Ayurvedic rituals.
              </span>
            </label>
          </div>
        </section>

        {/* ── Step 2: Shipping Address ── */}
        <section className="flex flex-col gap-3.5 border-t border-[var(--line)] pt-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--forest)] text-[0.68rem] font-bold text-white">
              2
            </span>
            <h3 className="font-serif text-[1.25rem] font-normal text-[var(--forest)]">
              Delivery Address
            </h3>
          </div>

          <div className="grid gap-3">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              <div>
                <label
                  htmlFor="checkout-first-name"
                  className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-first-name"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="e.g. Priya"
                  className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                    fieldErrors.firstName
                      ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                      : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                    ⚠️ {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-last-name"
                  className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-last-name"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="e.g. Sharma"
                  className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                    fieldErrors.lastName
                      ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                      : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                    ⚠️ {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label
                htmlFor="checkout-address1"
                className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
              >
                Address (House No., Building, Street) <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-address1"
                type="text"
                required
                value={formData.address1}
                onChange={(e) => handleInputChange("address1", e.target.value)}
                placeholder="e.g. Flat 402, Lotus Residency, 14th Main Road"
                className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                  fieldErrors.address1
                    ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                    : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                }`}
              />
              {fieldErrors.address1 && (
                <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                  ⚠️ {fieldErrors.address1}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label
                htmlFor="checkout-address2"
                className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
              >
                Apartment, Suite, Landmark (Optional)
              </label>
              <input
                id="checkout-address2"
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
                placeholder="e.g. Near Botanical Garden"
                className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-colors focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
              />
            </div>

            {/* City, State, PIN code */}
            <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
              <div>
                <label
                  htmlFor="checkout-city"
                  className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g. Mumbai"
                  className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                    fieldErrors.city
                      ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                      : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                  }`}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                    ⚠️ {fieldErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-state"
                  className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                >
                  State / UT <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="checkout-state"
                    value={formData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-[var(--line)] bg-[var(--paper)] pl-3.5 pr-9 text-[0.8rem] text-[var(--forest)] outline-none transition-colors focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15 cursor-pointer"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--forest)]/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-zip"
                  className="mb-1 block text-[0.64rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                >
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-zip"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  placeholder="e.g. 400001"
                  className={`h-11 w-full rounded-xl border bg-[var(--paper)] px-3.5 text-[0.8rem] text-[var(--forest)] placeholder:text-[var(--muted)]/60 outline-none transition-all ${
                    fieldErrors.zip
                      ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/15"
                      : "border-[var(--line)] focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
                  }`}
                />
                {fieldErrors.zip && (
                  <p className="mt-1 text-[0.68rem] font-semibold text-red-600">
                    ⚠️ {fieldErrors.zip}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.saveAddress}
                onChange={(e) => handleInputChange("saveAddress", e.target.checked)}
                className="size-4 rounded border-[var(--line)] text-[var(--forest)] accent-[var(--forest)]"
              />
              <span className="text-[0.72rem] text-[var(--muted)]">
                Save this address for fast checkout in future rituals.
              </span>
            </label>
          </div>
        </section>

        {/* ── Step 3: Shipping Method ── */}
        <section className="flex flex-col gap-3.5 border-t border-[var(--line)] pt-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--forest)] text-[0.68rem] font-bold text-white">
              3
            </span>
            <h3 className="font-serif text-[1.25rem] font-normal text-[var(--forest)]">
              Shipping Method
            </h3>
          </div>

          <div className="grid gap-2.5">
            {/* Standard Delivery */}
            <label
              className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                formData.shippingMethod === "standard"
                  ? "border-[#529d38] bg-[#edf3dd]/50 ring-2 ring-[#529d38]/20"
                  : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--ivory)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={formData.shippingMethod === "standard"}
                  onChange={() => handleShippingChange("standard")}
                  className="size-4 accent-[var(--forest)]"
                />
                <div>
                  <span className="text-[0.78rem] font-bold text-[var(--forest)]">
                    Standard Ayurvedic Delivery
                  </span>
                  <p className="text-[0.68rem] text-[var(--muted)] mt-0.5">
                    Estimated delivery in 3–5 business days across India.
                  </p>
                </div>
              </div>
              <span className="font-bold text-[0.82rem] text-[#529d38]">FREE</span>
            </label>

            {/* Express Air Delivery */}
            <label
              className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                formData.shippingMethod === "express"
                  ? "border-[#529d38] bg-[#edf3dd]/50 ring-2 ring-[#529d38]/20"
                  : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--ivory)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={formData.shippingMethod === "express"}
                  onChange={() => handleShippingChange("express")}
                  className="size-4 accent-[var(--forest)]"
                />
                <div>
                  <span className="text-[0.78rem] font-bold text-[var(--forest)]">
                    Express Priority Air Courier
                  </span>
                  <p className="text-[0.68rem] text-[var(--muted)] mt-0.5">
                    Dispatched within 12 hours. Arrives in 1–2 business days.
                  </p>
                </div>
              </div>
              <span className="font-bold text-[0.82rem] text-[var(--forest)]">₹149</span>
            </label>
          </div>
        </section>

        {/* ── Step 4: Payment Method ── */}
        <section className="flex flex-col gap-3.5 border-t border-[var(--line)] pt-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[var(--forest)] text-[0.68rem] font-bold text-white">
              4
            </span>
            <h3 className="font-serif text-[1.25rem] font-normal text-[var(--forest)]">
              Payment & Placement
            </h3>
          </div>

          <div className="grid gap-2.5">
            {/* 1. All-in-One Online Payment via Razorpay */}
            <label
              className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                formData.paymentMethod === "shopify" || !isCodEnabled
                  ? "border-[var(--forest)] bg-[#edf3dd]/50 ring-2 ring-[var(--forest)]/15 shadow-sm"
                  : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--ivory)]"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="shopify"
                checked={formData.paymentMethod === "shopify" || !isCodEnabled}
                onChange={() => handleInputChange("paymentMethod", "shopify")}
                className="mt-0.5 size-4 accent-[var(--forest)] shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[0.84rem] font-bold text-[var(--forest)]">
                    Pay Online (UPI, QR, Cards, Net Banking & Wallets)
                  </span>
                  <span className="text-[0.74rem] font-semibold text-[var(--forest)]">
                    {finalPayableAmount}
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-[var(--muted)]">
                  Pay securely via Razorpay with UPI (Google Pay, PhonePe, Paytm), Debit / Credit Cards, Net Banking, or Wallets.
                </p>
              </div>
            </label>

            {/* 2. Cash on Delivery (COD) - Conditionally shown only when enabled */}
            {isCodEnabled && (
              <label
                className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                  formData.paymentMethod === "cod"
                    ? "border-[var(--forest)] bg-[#edf3dd]/50 ring-2 ring-[var(--forest)]/15"
                    : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--ivory)]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={() => handleInputChange("paymentMethod", "cod")}
                  className="mt-0.5 size-4 accent-[var(--forest)]"
                />
                <div className="flex-1">
                  <span className="text-[0.82rem] font-bold text-[var(--forest)]">
                    Cash on Delivery (Pay at Doorstep)
                  </span>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-[var(--muted)]">
                    Pay securely with Cash, UPI, or Card directly to the courier partner when your ritual arrives.
                  </p>
                </div>
              </label>
            )}
          </div>
        </section>

        {/* ── Place Order Action ── */}
        <div className="flex flex-col gap-3 pt-2">
          {errorMessage && (
            <div
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[0.74rem] font-semibold text-red-700"
              role="alert"
            >
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isCartBusy || !cart.length}
            className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-6 py-3.5 text-[0.8rem] max-[440px]:text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--paper)] shadow-[0_12px_32px_rgba(21,59,45,0.22)] transition-all hover:bg-[var(--forest-dark)] hover:shadow-[0_16px_36px_rgba(21,59,45,0.28)] active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>
                  {formData.paymentMethod === "cod" && isCodEnabled
                    ? "Placing Cash on Delivery Order…"
                    : "Opening Razorpay Gateway…"}
                </span>
              </span>
            ) : formData.paymentMethod === "cod" && isCodEnabled ? (
              <span className="whitespace-nowrap">Place Order (Cash on Delivery) ➔</span>
            ) : (
              <span>Pay Online via Razorpay ({finalPayableAmount}) ➔</span>
            )}
          </button>

          <p className="text-center text-[0.66rem] text-[var(--muted)]">
            By placing your order, you agree to NatureMist’s Terms of Service and Privacy Policy. Review each product’s intended use and current directions before starting your ritual.
          </p>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
