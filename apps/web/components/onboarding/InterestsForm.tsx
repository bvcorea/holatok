"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { saveInterests, type InterestsState } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INTERESTS = [
  { value: "KPOP", label: "K-Pop", emoji: "🎵", desc: "Música y grupos coreanos" },
  { value: "KDRAMA", label: "K-Drama", emoji: "🎬", desc: "Series y películas" },
  { value: "KBEAUTY", label: "K-Beauty", emoji: "✨", desc: "Skincare y maquillaje" },
  { value: "KFOOD", label: "K-Food", emoji: "🍜", desc: "Gastronomía coreana" },
  { value: "KTRAVEL", label: "K-Travel", emoji: "✈️", desc: "Viajes a Corea" },
] as const;

const initialState: InterestsState = {};

interface Props {
  onNext: () => void;
}

export function InterestsForm({ onNext }: Props) {
  const locale = useLocale();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, formAction, isPending] = useActionState(saveInterests, initialState);

  useEffect(() => {
    if (state.success) onNext();
  }, [state.success, onNext]);

  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">¿Qué te apasiona de Corea?</h2>
        <p className="text-muted-foreground">
          Selecciona tus categorías favoritas (puedes elegir varias)
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTERESTS.map((interest) => {
            const isSelected = selected.has(interest.value);
            return (
              <label
                key={interest.value}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  isSelected
                    ? "border-[#FF6B6B] bg-[#FF6B6B]/5 ring-1 ring-[#FF6B6B]"
                    : "border-input hover:border-[#FF6B6B]/50"
                )}
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={interest.value}
                  checked={isSelected}
                  onChange={() => toggle(interest.value)}
                  className="sr-only"
                />
                <span className="text-2xl">{interest.emoji}</span>
                <div>
                  <p className="font-medium text-sm">{interest.label}</p>
                  <p className="text-xs text-muted-foreground">{interest.desc}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto h-5 w-5 rounded-full bg-[#FF6B6B] flex items-center justify-center flex-shrink-0">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {state.error && (
          <p className="text-sm text-destructive text-center">{state.error}</p>
        )}

        {selected.size === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Selecciona al menos un interés para continuar
          </p>
        )}

        <Button
          type="submit"
          variant="coral"
          className="w-full"
          disabled={isPending || selected.size === 0}
        >
          {isPending ? "Guardando..." : "Continuar →"}
        </Button>
      </form>
    </div>
  );
}
