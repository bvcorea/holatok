"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import { useCartStore } from "@/stores/cart";
import { createCheckoutSession, type CheckoutState } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const COUNTRIES = [
  { value: "MX", label: "🇲🇽 México" },
  { value: "BR", label: "🇧🇷 Brasil" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "CL", label: "🇨🇱 Chile" },
  { value: "PE", label: "🇵🇪 Perú" },
] as const;

const initialState: CheckoutState = {};

interface Props {
  publishableKey: string;
}

export function CheckoutForm({ publishableKey }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { items, totalUSD, clearCart } = useCartStore();
  const [state, formAction, isPending] = useActionState(
    createCheckoutSession,
    initialState
  );

  useEffect(() => {
    if (state.clientSecret && publishableKey) {
      handleStripePayment(state.clientSecret);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.clientSecret]);

  const handleStripePayment = async (clientSecret: string) => {
    const stripeInstance = await loadStripe(publishableKey);
    if (!stripeInstance) return;

    // Confirm the payment (in production, use Stripe Elements for card input)
    // For now, redirect to success page
    clearCart();
    router.push(`/${locale}/tienda/checkout/exito?orderId=${state.orderId}`);
  };

  const total = totalUSD();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30" />
        <p className="text-lg font-medium">Tu carrito está vacío</p>
        <Link href={`/${locale}/tienda`}>
          <Button variant="coral">Ver productos →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <div className="rounded-xl border p-4 bg-muted/30">
        <h2 className="font-semibold mb-3">Resumen del pedido</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.nameEs} × {item.quantity}
              </span>
              <span className="font-medium">
                ${(item.priceUSD * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#FF6B6B]">${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Checkout form */}
      <form action={formAction} className="space-y-4">
        {/* Hidden fields */}
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map((i) => ({
              productId: i.id,
              nameEs: i.nameEs,
              quantity: i.quantity,
              priceUSD: i.priceUSD,
              priceKRW: 0,
            }))
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="country">País de entrega</Label>
          <select
            id="country"
            name="country"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Selecciona tu país</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" required minLength={2} placeholder="Como en tu documento" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" required minLength={5} placeholder="Calle, número, colonia" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" required minLength={2} placeholder="Tu ciudad" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" required minLength={6} placeholder="+52 55 0000 0000" />
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <div className="rounded-xl border border-[#4A90D9]/30 bg-[#4A90D9]/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">💳 Pago seguro con Stripe</p>
          <p>Aceptamos Visa, Mastercard, Amex y métodos locales (PIX, OXXO)</p>
        </div>

        <Button
          type="submit"
          variant="coral"
          className="w-full h-11 text-base"
          disabled={isPending}
        >
          {isPending
            ? "Procesando..."
            : `Pagar $${total.toFixed(2)} USD →`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Al pagar aceptas nuestros términos · Envío en 15-20 días hábiles
        </p>
      </form>
    </div>
  );
}
