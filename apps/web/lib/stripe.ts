import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const CURRENCY_BY_COUNTRY: Record<string, string> = {
  MX: "mxn",
  BR: "brl",
  CO: "cop",
  AR: "ars",
  CL: "clp",
  PE: "pen",
};

// Exchange rates (approximate — use real API in production)
export const USD_TO_LOCAL: Record<string, number> = {
  MX: 17.5,
  BR: 5.0,
  CO: 4000,
  AR: 900,
  CL: 920,
  PE: 3.75,
};
