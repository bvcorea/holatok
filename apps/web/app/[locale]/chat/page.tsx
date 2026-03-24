import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { PersonaCard } from "@/components/chat/PersonaCard";
import { PERSONA_LIST } from "@/lib/personas";

export const metadata: Metadata = { title: "Chat con IA K-Culture" };

export default async function ChatPage() {
  const locale = await getLocale();

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Chat con IA K-Culture</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Elige tu compañero virtual y conversa sobre K-Pop, aprende coreano,
            planifica tu viaje o descubre recetas coreanas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONA_LIST.map((persona) => (
            <PersonaCard key={persona.key} persona={persona} locale={locale} />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Conversaciones impulsadas por Claude AI · Tus chats se guardan en tu cuenta
        </p>
      </main>
    </>
  );
}
