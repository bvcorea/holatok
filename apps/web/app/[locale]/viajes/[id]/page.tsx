import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Clock, Users, MapPin, ArrowLeft, CalendarDays } from "lucide-react";
import { getTravelPackageById } from "@repo/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pkg = await getTravelPackageById(id);
  return { title: pkg?.titleEs ?? "Paquete de viaje" };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const pkg = await getTravelPackageById(id);
  if (!pkg) notFound();

  const price = Number(pkg.priceUSD);

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back */}
        <Link
          href={`/${locale}/viajes`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a paquetes
        </Link>

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FF6B6B]/10 to-[#4A90D9]/10 border p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pkg.titleEs}</h1>
              <p className="text-muted-foreground max-w-xl">{pkg.descriptionEs}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Precio por persona</p>
              <p className="text-4xl font-bold text-[#FF6B6B]">
                ${price.toLocaleString("es-MX")}
                <span className="text-base font-normal text-muted-foreground ml-1">USD</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#FF6B6B]" />
              <span>{pkg.daysCount} días / {pkg.nights} noches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#4A90D9]" />
              <span>Máximo {pkg.maxGroupSize} personas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>Seúl y alrededores, Corea del Sur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <span>{pkg._count.bookings} reservas realizadas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itinerary */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Itinerario</h2>

            {pkg.days.length > 0 ? (
              pkg.days.map((day) => (
                <div key={day.id} className="rounded-xl border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {day.dayNumber}
                    </div>
                    <h3 className="font-semibold">
                      Día {day.dayNumber}
                      {day.title && ` — ${day.title}`}
                    </h3>
                  </div>
                  {day.description && (
                    <p className="text-sm text-muted-foreground ml-11">
                      {day.description}
                    </p>
                  )}
                  {day.places.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-11">
                      {day.places.map((place) => (
                        <Badge key={place.id} variant="secondary" className="text-xs">
                          📍 {place.nameEs ?? place.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border p-6 text-center text-muted-foreground">
                <p>Itinerario detallado disponible al reservar.</p>
                <p className="text-sm mt-1">Contacta con nuestro Guía para más información.</p>
              </div>
            )}
          </div>

          {/* Booking CTA */}
          <div className="space-y-4">
            <div className="rounded-xl border p-5 sticky top-4 space-y-4">
              <h3 className="font-bold text-lg">Reservar paquete</h3>

              <div className="space-y-2 text-sm">
                {[
                  "✅ Guía en español",
                  "✅ Transporte aeropuerto",
                  "✅ Hotel incluido",
                  "✅ Entradas a atracciones",
                  "✅ Soporte 24/7",
                ].map((item) => (
                  <p key={item} className="text-muted-foreground">
                    {item}
                  </p>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-2xl font-bold text-[#FF6B6B] mb-1">
                  ${price.toLocaleString("es-MX")} USD
                </p>
                <p className="text-xs text-muted-foreground mb-4">por persona · todo incluido</p>

                <Link href={`/${locale}/chat/guide`}>
                  <Button variant="coral" className="w-full">
                    💬 Consultar disponibilidad
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Chatea con nuestro guía para reservar
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
