import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTravelPackages } from "@repo/db";
import { Navbar } from "@/components/layout/Navbar";
import { PackageCard } from "@/components/travel/PackageCard";

export const metadata: Metadata = { title: "Paquetes de Viaje a Corea" };

const COUNTRY_FILTERS = [
  { value: "", label: "🌎 Todos" },
  { value: "MX", label: "🇲🇽 México" },
  { value: "BR", label: "🇧🇷 Brasil" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "CL", label: "🇨🇱 Chile" },
  { value: "PE", label: "🇵🇪 Perú" },
] as const;

interface PageProps {
  searchParams: Promise<{ pais?: string }>;
}

export default async function ViajesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();

  const validCountries = ["MX", "BR", "CO", "AR", "CL", "PE", "KR"];
  const country = validCountries.includes(params.pais ?? "")
    ? (params.pais as "MX" | "BR" | "CO" | "AR" | "CL" | "PE" | "KR")
    : undefined;

  const packages = await getTravelPackages(country);

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            ✈️ Viaja a{" "}
            <span className="text-[#FF6B6B]">Corea</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Paquetes diseñados especialmente para latinoamericanos. Incluye vuelos,
            hotel, guía en español y experiencias únicas de K-Culture.
          </p>
        </div>

        {/* Country filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {COUNTRY_FILTERS.map((filter) => (
            <a
              key={filter.value}
              href={filter.value ? `?pais=${filter.value}` : "?"}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                (params.pais ?? "") === filter.value
                  ? "bg-[#FF6B6B] text-white border-[#FF6B6B]"
                  : "bg-background border-input hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
              }`}
            >
              {filter.label}
            </a>
          ))}
        </div>

        {/* Packages grid */}
        {packages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No hay paquetes disponibles para este país</p>
            <a
              href="?"
              className="mt-4 inline-block text-[#FF6B6B] hover:underline text-sm"
            >
              Ver todos los paquetes →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                titleEs={pkg.titleEs}
                descriptionEs={pkg.descriptionEs}
                country={pkg.country}
                daysCount={pkg.daysCount}
                nights={pkg.nights}
                priceUSD={Number(pkg.priceUSD)}
                thumbnailUrl={pkg.thumbnailUrl}
                bookingsCount={pkg._count.bookings}
                maxGroupSize={pkg.maxGroupSize}
                locale={locale}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#FF6B6B]/10 to-[#4A90D9]/10 border p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">¿No encuentras lo que buscas?</h2>
          <p className="text-muted-foreground mb-4">
            Creamos paquetes personalizados según tu presupuesto y fechas
          </p>
          <a
            href={`/${locale}/chat/guide`}
            className="inline-flex items-center gap-2 bg-[#4A90D9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A90D9]/90 transition-colors"
          >
            🗺️ Hablar con el Guía
          </a>
        </div>
      </main>
    </>
  );
}
