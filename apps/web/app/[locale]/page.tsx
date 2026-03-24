import { useTranslations } from "next-intl";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  {
    key: "kpop",
    label: "K-Pop",
    emoji: "🎵",
    description: "Música, grupos y novedades del K-Pop",
    badge: "kpop" as const,
    bg: "from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20",
    border: "border-pink-200 dark:border-pink-800",
  },
  {
    key: "kdrama",
    label: "K-Drama",
    emoji: "🎬",
    description: "Series y películas coreanas con subtítulos",
    badge: "kdrama" as const,
    bg: "from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20",
    border: "border-teal-200 dark:border-teal-800",
  },
  {
    key: "kbeauty",
    label: "K-Beauty",
    emoji: "✨",
    description: "Skincare, maquillaje y rutinas coreanas",
    badge: "kbeauty" as const,
    bg: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    key: "kfood",
    label: "K-Food",
    emoji: "🍜",
    description: "Recetas, restaurantes y snacks coreanos",
    badge: "kfood" as const,
    bg: "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    key: "ktravel",
    label: "K-Travel",
    emoji: "✈️",
    description: "Guías y paquetes de viaje a Corea",
    badge: "ktravel" as const,
    bg: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
] as const;

const COUNTRIES = ["🇲🇽", "🇧🇷", "🇨🇴", "🇦🇷", "🇨🇱", "🇵🇪"];

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B]/10 via-background to-[#4A90D9]/10 py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <div className="flex justify-center gap-2 text-2xl">
              {COUNTRIES.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Tu portal de{" "}
              <span className="text-[#FF6B6B]">K-Culture</span>
              <br />
              en <span className="text-[#4A90D9]">Latinoamérica</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explora K-Pop, K-Drama, K-Beauty, K-Food y viajes a Corea — todo
              en español y portugués para ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex items-center justify-center rounded-lg bg-[#FF6B6B] px-8 py-3 text-white font-semibold hover:bg-[#FF6B6B]/90 transition-colors"
              >
                Únete gratis
              </Link>
              <Link
                href={`/${locale}/contenido`}
                className="inline-flex items-center justify-center rounded-lg border px-8 py-3 font-semibold hover:bg-accent transition-colors"
              >
                Explorar contenido
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-3">
              Explora por categoría
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              Todo lo que amas de Corea, en un solo lugar
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  href={`/${locale}/contenido?categoria=${cat.key}`}
                  className={`group rounded-xl border p-6 bg-gradient-to-br ${cat.bg} ${cat.border} hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{cat.emoji}</span>
                    <Badge variant={cat.badge}>{cat.label}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </Link>
              ))}

              {/* Chat persona card */}
              <Link
                href={`/${locale}/chat`}
                className="group rounded-xl border p-6 bg-gradient-to-br from-[#FF6B6B]/10 to-[#4A90D9]/10 border-[#FF6B6B]/20 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">💬</span>
                  <Badge className="bg-[#FF6B6B] text-white border-0">
                    Chat IA
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-1">Chat con IA</h3>
                <p className="text-sm text-muted-foreground">
                  Practica coreano con Oppa, Unni, Saem y más personajes
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-10">
              ¿Por qué Hola Talk?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                {
                  icon: "🌎",
                  title: "Hecho para Latam",
                  desc: "Contenido en español y portugués, con precios en tu moneda local",
                },
                {
                  icon: "🤖",
                  title: "IA conversacional",
                  desc: "Practica coreano con personajes únicos usando inteligencia artificial",
                },
                {
                  icon: "🛍️",
                  title: "Todo en uno",
                  desc: "Contenido, viajes, compras y comunidad en una sola plataforma",
                },
              ].map((f) => (
                <div key={f.title} className="space-y-3">
                  <div className="text-4xl">{f.icon}</div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
