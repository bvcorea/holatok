"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { loginUser, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, initialState);

  useEffect(() => {
    if (state.success) {
      const dest = next === "onboarding"
        ? `/${locale}/onboarding`
        : `/${locale}`;
      router.push(dest);
      router.refresh();
    }
  }, [state.success, locale, router, next]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        variant="coral"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
