import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { PERSONAS, type PersonaKey } from "@/lib/personas";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ persona: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { persona } = await params;
  const key = persona.toUpperCase() as PersonaKey;
  const config = PERSONAS[key];
  if (!config) return { title: "Chat" };
  return { title: `Chat con ${config.name}` };
}

export default async function PersonaChatPage({ params }: PageProps) {
  const { persona } = await params;
  const locale = await getLocale();

  const key = persona.toUpperCase() as PersonaKey;
  const personaConfig = PERSONAS[key];
  if (!personaConfig) notFound();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r",
          personaConfig.bg
        )}
      >
        <Link
          href={`/${locale}/chat`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="flex items-center gap-3 ml-2">
          <span className="text-3xl">{personaConfig.emoji}</span>
          <div>
            <h1 className={cn("font-bold leading-tight", personaConfig.color)}>
              {personaConfig.name}
            </h1>
            <p className="text-xs text-muted-foreground">{personaConfig.role}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">En línea</span>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface persona={personaConfig} />
      </div>
    </div>
  );
}
