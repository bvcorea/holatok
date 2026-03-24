"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Todo" },
  { value: "KPOP_MERCHANDISE", label: "🎵 K-Pop" },
  { value: "KBEAUTY", label: "✨ K-Beauty" },
  { value: "FOOD", label: "🍜 Comida" },
  { value: "CLOTHING", label: "👗 Ropa" },
  { value: "ACCESSORIES", label: "💍 Accesorios" },
] as const;

export function ProductFilter({ currentCategory }: { currentCategory: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat) params.set("categoria", cat);
      else params.delete("categoria");
      params.delete("pagina");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            currentCategory === cat.value
              ? "bg-[#FF6B6B] text-white border-[#FF6B6B]"
              : "bg-background border-input hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
