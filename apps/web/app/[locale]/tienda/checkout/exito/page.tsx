import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "¡Compra exitosa!" };

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">¡Pedido confirmado!</h1>
          <p className="text-muted-foreground">
            Tu pedido ha sido recibido y está siendo procesado. Te enviaremos
            un correo de confirmación en breve.
          </p>
        </div>

        {params.orderId && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Número de pedido</p>
            <p className="font-mono text-sm font-medium mt-0.5">
              #{params.orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📦 Envío estimado: 15-20 días hábiles</p>
            <p>✉️ Recibirás actualizaciones por email</p>
            <p>💬 ¿Preguntas? Chatea con nosotros</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/${locale}/tienda`}>
            <Button variant="coral" className="w-full">
              Seguir comprando
            </Button>
          </Link>
          <Link href={`/${locale}`}>
            <Button variant="outline" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
