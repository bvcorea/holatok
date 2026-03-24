"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const { items, removeItem, updateQuantity, totalItems, totalUSD } =
    useCartStore();

  const itemCount = totalItems();
  const total = totalUSD();

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 text-sm font-medium hover:text-[#FF6B6B] transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF6B6B] text-white text-[10px] flex items-center justify-center font-bold">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#FF6B6B]" />
            Carrito ({itemCount})
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 opacity-30" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <div className="h-14 w-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.nameEs}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "🛍️"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.nameEs}
                  </p>
                  <p className="text-sm text-[#FF6B6B] font-semibold">
                    ${item.priceUSD.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center ml-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-[#FF6B6B] text-xl">
                ${total.toFixed(2)} USD
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Envío a Latinoamérica · ~15-20 días hábiles
            </p>
            <Link href={`/${locale}/tienda/checkout`} onClick={() => setOpen(false)}>
              <Button variant="coral" className="w-full">
                Proceder al pago →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
