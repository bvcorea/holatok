import Link from "next/link";
import Image from "next/image";
import { Clock, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COUNTRY_FLAG: Record<string, string> = {
  MX: "🇲🇽",
  BR: "🇧🇷",
  CO: "🇨🇴",
  AR: "🇦🇷",
  CL: "🇨🇱",
  PE: "🇵🇪",
  KR: "🇰🇷",
};

const COUNTRY_NAME: Record<string, string> = {
  MX: "México",
  BR: "Brasil",
  CO: "Colombia",
  AR: "Argentina",
  CL: "Chile",
  PE: "Perú",
  KR: "Corea",
};

interface PackageCardProps {
  id: string;
  titleEs: string;
  descriptionEs: string;
  country: string;
  daysCount: number;
  nights: number;
  priceUSD: number | string;
  thumbnailUrl?: string | null;
  bookingsCount?: number;
  maxGroupSize: number;
  locale: string;
}

export function PackageCard({
  id,
  titleEs,
  descriptionEs,
  country,
  daysCount,
  nights,
  priceUSD,
  thumbnailUrl,
  bookingsCount = 0,
  maxGroupSize,
  locale,
}: PackageCardProps) {
  const price = typeof priceUSD === "string" ? parseFloat(priceUSD) : priceUSD;
  const spotsLeft = maxGroupSize - bookingsCount;

  return (
    <Link
      href={`/${locale}/viajes/${id}`}
      className="group block rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#FF6B6B]/20 to-[#4A90D9]/20 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={titleEs}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🇰🇷</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-background/90 text-foreground border-0 text-xs">
            {COUNTRY_FLAG[country]} Para {COUNTRY_NAME[country] ?? country}
          </Badge>
        </div>

        {spotsLeft <= 3 && spotsLeft > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#FF6B6B] text-white border-0 text-xs">
              ¡Solo {spotsLeft} lugar{spotsLeft > 1 ? "es" : ""}!
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-[#FF6B6B] transition-colors">
          {titleEs}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {descriptionEs}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysCount}D / {nights}N
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Máx. {maxGroupSize} personas</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Seúl, Corea</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-2xl font-bold text-[#FF6B6B]">
              ${price.toLocaleString("es-MX")}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                USD
              </span>
            </p>
          </div>
          <span className="text-sm font-medium text-[#4A90D9] group-hover:underline">
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  );
}
