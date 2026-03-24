import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

interface PageProps {
  searchParams: Promise<{ registered?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const next = params.next;

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
          <CardDescription>
            {params.registered === "1"
              ? "¡Cuenta creada! Inicia sesión para continuar"
              : "Inicia sesión en tu cuenta de Hola Talk"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                o continúa con email
              </span>
            </div>
          </div>

          <LoginForm next={next} />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href={`/${locale}/auth/register`}
              className="font-medium text-[#FF6B6B] hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
