import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { updatePaymentStatus } from "@repo/db";
import { prisma } from "@repo/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await updatePaymentStatus(pi.id, "COMPLETED");

        // Update order status to PAID
        const payment = await prisma.payment.findFirst({
          where: { externalId: pi.id },
        });
        if (payment?.orderId) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await updatePaymentStatus(pi.id, "FAILED");
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object;
        await updatePaymentStatus(pi.id, "FAILED");
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
