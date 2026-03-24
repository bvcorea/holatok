"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { saveProfile, type ProfileState } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProfileState = {};

interface Props {
  userName?: string | null;
  onComplete: () => void;
}

export function ProfileForm({ userName, onComplete }: Props) {
  const [state, formAction, isPending] = useActionState(saveProfile, initialState);

  useEffect(() => {
    if (state.success) onComplete();
  }, [state.success, onComplete]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Cuéntanos sobre ti</h2>
        <p className="text-muted-foreground">
          Personaliza tu perfil para conectar con otros fans
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">¿Cómo te llamamos?</Label>
          <Input
            id="name"
            name="name"
            placeholder="Tu nombre o apodo"
            defaultValue={userName ?? ""}
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">
            Bio{" "}
            <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Ej: Fan de K-Pop desde Bogotá, obsesionada con BTS 💜"
            maxLength={200}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Ciudad{" "}
            <span className="text-xs text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="Ej: Ciudad de México"
            maxLength={100}
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
          {isPending ? "Guardando..." : "¡Listo! Explorar Hola Talk →"}
        </Button>
      </form>
    </div>
  );
}
