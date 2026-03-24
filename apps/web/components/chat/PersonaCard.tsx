import Link from "next/link";
import { useLocale } from "next-intl";
import { type PersonaConfig } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface Props {
  persona: PersonaConfig;
  locale: string;
}

export function PersonaCard({ persona, locale }: Props) {
  return (
    <Link
      href={`/${locale}/chat/${persona.key.toLowerCase()}`}
      className={cn(
        "group block rounded-2xl border p-6 bg-gradient-to-br transition-all hover:shadow-lg hover:-translate-y-0.5",
        persona.bg,
        "border-transparent hover:border-current/10"
      )}
    >
      <div className="flex items-start gap-4">
        <span className="text-5xl">{persona.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={cn("font-bold text-lg", persona.color)}>
              {persona.name}
            </h3>
            <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
              {persona.role}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {persona.description}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-background/60 border border-border/50">
        <p className="text-xs text-muted-foreground italic line-clamp-2">
          &ldquo;{persona.greeting}&rdquo;
        </p>
      </div>

      <div
        className={cn(
          "mt-4 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all",
          persona.color
        )}
      >
        Chatear ahora
        <span>→</span>
      </div>
    </Link>
  );
}
