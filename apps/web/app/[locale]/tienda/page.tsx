import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@repo/db";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductFilter } from "@/components/commerce/ProductFilter";

export const metadata: Metadata = { title: "Tienda K-Culture" };

const VALID_CATEGORIES = [
  "KPOP_MERCHANDISE", "KBEAUTY", "FOOD", "CLOTHING", "ACCESSORIES", "ELECTRONICS", "OTHER"
];

interface PageProps {
  searchParams: Promise<{ categoria?: string; q?: string; pagina?: string }>;
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const category = VALID_CATEGORIES.includes(params.categoria ?? "")
    ? (params.categoria as "KPOP_MERCHANDISE" | "KBEAUTY" | "FOOD" | "CLOTHING" | "ACCESSORIES" | "ELECTRONICS" | "OTHER")
    : undefined;

  const { items, total, totalPages, page, hasNext } = await getProducts({
    category,
    search: params.q,
    page: Math.max(1, parseInt(params.pagina ?? "1")),
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            🛍️ Tienda <span className="text-[#FF6B6B]">K-Culture</span>
          </h1>
          <p className="text-muted-foreground">
            Productos originales de Corea · Envío a toda Latinoamérica
            {total > 0 && ` · ${total} productos`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <ProductFilter currentCategory={params.categoria ?? ""} />
          </Suspense>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No hay productos disponibles</p>
            <p className="text-sm mt-1">
              {category
                ? "Prueba con otra categoría"
                : "Vuelve pronto — estamos cargando el catálogo"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nameEs={product.nameEs}
                descriptionEs={product.descriptionEs}
                category={product.category}
                priceUSD={Number(product.priceUSD)}
                imageUrls={product.imageUrls}
                stock={product.stock}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {page > 1 && (
              <a
                href={`?${buildQuery({ ...params, pagina: String(page - 1) })}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent text-sm transition-colors"
              >
                ← Anterior
              </a>
            )}
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {hasNext && (
              <a
                href={`?${buildQuery({ ...params, pagina: String(page + 1) })}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent text-sm transition-colors"
              >
                Siguiente →
              </a>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function buildQuery(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v);
  }
  return p.toString();
}
