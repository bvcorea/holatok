import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";

export const metadata: Metadata = { title: "Pago · Tienda" };

export default async function CheckoutPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>
        <CheckoutForm
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
        />
      </main>
    </>
  );
}
