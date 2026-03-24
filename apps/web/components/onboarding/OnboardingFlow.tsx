"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { InterestsForm } from "./InterestsForm";
import { ProfileForm } from "./ProfileForm";
import { completeOnboarding } from "@/actions/onboarding";

const STEPS = [
  { id: 1, label: "Intereses" },
  { id: 2, label: "Perfil" },
];

interface Props {
  userName?: string | null;
}

export function OnboardingFlow({ userName }: Props) {
  const [step, setStep] = useState(1);
  const locale = useLocale();

  const goToNext = useCallback(() => setStep((s) => s + 1), []);

  const handleComplete = useCallback(async () => {
    await completeOnboarding();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#FF6B6B]/5 via-background to-[#4A90D9]/5">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-[#FF6B6B]">Hola</span>
            <span className="text-[#4A90D9]">Talk</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bienvenido/a — configura tu experiencia
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                  step >= s.id
                    ? "bg-[#FF6B6B] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <span
                className={`text-sm ${
                  step >= s.id ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-10 mx-1 rounded transition-colors ${
                    step > s.id ? "bg-[#FF6B6B]" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          {step === 1 && <InterestsForm onNext={goToNext} />}
          {step === 2 && (
            <ProfileForm userName={userName} onComplete={handleComplete} />
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={handleComplete}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    </div>
  );
}
