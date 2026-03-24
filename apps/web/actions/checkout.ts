"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { stripe, CURRENCY_BY_COUNTRY, USD_TO_LOCAL } from "@/lib/stripe";
import { createOrder, createPaymentRecord } from "@repo/db";
import type { Country } from "@repo/db";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        nameEs: z.string(),
        quantity: z.number().min(1),
        priceUSD: z.number(),
        priceKRW: z.number().default(0),
      })
    )
    .min(1),
  country: z.enum(["MX", "BR", "CO", "AR", "CL", "PE"]),
  shippingAddress: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    phone: z.string().min(6),
  }),
});

export type CheckoutState = {
  error?: string;
  clientSecret?: string;
  orderId?: string;
};

export async function createCheckoutSession(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Debes iniciar sesión" };

  const rawItems = formData.get("items");
  const parsed = checkoutSchema.safeParse({
    items: rawItems ? JSON.parse(rawItems as string) : [],
    country: formData.get("country"),
    shippingAddress: {
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
      phone: formData.get("phone"),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { items, country, shippingAddress } = parsed.data;

  const usdAmount = items.reduce(
    (sum, item) => sum + item.priceUSD * item.quantity,
    0
  );

  const exchangeRate = USD_TO_LOCAL[country] ?? 1;
  const localCurrency = CURRENCY_BY_COUNTRY[country] ?? "usd";
  const localAmount = usdAmount * exchangeRate;

  // Create order in DB
  const order = await createOrder({
    userId: session.user.id,
    country: country as Country,
    localCurrency,
    localAmount: Math.round(localAmount * 100) / 100,
    usdAmount: Math.round(usdAmount * 100) / 100,
    exchangeRate: Math.round(exchangeRate * 10000) / 10000,
    shippingAddress,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceKRW: item.priceKRW,
      priceUSD: item.priceUSD,
    })),
  });

  // Create Stripe PaymentIntent
  const amountInCents = Math.round(usdAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      orderId: order.id,
      userId: session.user.id,
      country,
    },
    description: `Hola Talk — ${items.length} producto(s) para ${country}`,
  });

  await createPaymentRecord({
    orderId: order.id,
    provider: "STRIPE",
    externalId: paymentIntent.id,
    amount: usdAmount,
    currency: "usd",
  });

  return {
    clientSecret: paymentIntent.client_secret ?? undefined,
    orderId: order.id,
  };
}
