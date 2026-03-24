"use client";

import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";

const CATEGORY_LABEL: Record<string, string> = {
  KPOP_MERCHANDISE: "K-Pop",
  KBEAUTY: "K-Beauty",
  FOOD: "K-Food",
  CLOTHING: "Ropa",
  ACCESSORIES: "Accesorios",
  ELECTRONICS: "Electrónica",
  OTHER: "Otro",
};

interface ProductCardProps {
  id: string;
  nameEs: string;
  descriptionEs: string;
  category: string;
  priceUSD: number;
  imageUrls: string[];
  stock: number;
}

export function ProductCard({
  id,
  nameEs,
  descriptionEs,
  category,
  priceUSD,
  imageUrls,
  stock,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.id === id);
  const imageUrl = imageUrls[0];

  const handleAdd = () => {
    addItem({ id, nameEs, priceUSD, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-all">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[#FF6B6B]/10 to-[#4A90D9]/10 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nameEs}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            🛍️
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABEL[category] ?? category}
          </Badge>
        </div>
        {stock <= 5 && stock > 0 && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white border-0 text-xs">
              ¡Solo {stock}!
            </Badge>
          </div>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="font-semibold text-muted-foreground">Agotado</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug">
          {nameEs}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {descriptionEs}
        </p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xl font-bold text-[#FF6B6B]">
            ${priceUSD.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              USD
            </span>
          </p>

          <Button
            variant={added || inCart ? "outline" : "coral"}
            size="sm"
            onClick={handleAdd}
            disabled={stock === 0}
            className="flex items-center gap-1.5"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {inCart ? "Agregar más" : "Agregar"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
