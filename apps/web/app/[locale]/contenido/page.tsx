import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { getContents, getUserLikesAndBookmarks, type KCategory } from "@repo/db";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/Navbar";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentFilter } from "@/components/content/ContentFilter";
import { SearchBar } from "@/components/content/SearchBar";

export const metadata: Metadata = { title: "Explorar Contenido" };

const VALID_CATEGORIES = ["KPOP", "KDRAMA", "KBEAUTY", "KFOOD", "KTRAVEL"];

interface PageProps {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    pagina?: string;
  }>;
}

export default async function ContenidoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const session = await auth();

  const categoria = VALID_CATEGORIES.includes(params.categoria ?? "")
    ? (params.categoria as KCategory)
    : undefined;
  const page = Math.max(1, parseInt(params.pagina ?? "1"));
  const search = params.q;

  const { items, total, totalPages, hasNext } = await getContents({
    category: categoria,
    page,
    search,
  });

  // Fetch user interactions if logged in
  let likedIds = new Set<string>();
  let bookmarkedIds = new Set<string>();
  if (session?.user?.id && items.length > 0) {
    const interactions = await getUserLikesAndBookmarks(
      session.user.id,
      items.map((i) => i.id)
    );
    likedIds = interactions.likedIds;
    bookmarkedIds = interactions.bookmarkedIds;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Explorar Contenido</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} videos de K-Culture para ti
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Suspense fallback={null}>
            <ContentFilter currentCategory={params.categoria ?? ""} />
          </Suspense>
          <div className="sm:ml-auto">
            <Suspense fallback={null}>
              <SearchBar defaultValue={search} />
            </Suspense>
          </div>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No se encontró contenido</p>
            <p className="text-sm mt-1">Intenta con otra categoría o búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                titleEs={item.titleEs}
                thumbnailUrl={item.thumbnailUrl}
                category={item.category}
                viewCount={item.viewCount}
                likesCount={item._count.likes}
                bookmarksCount={item._count.bookmarks}
                isLiked={likedIds.has(item.id)}
                isBookmarked={bookmarkedIds.has(item.id)}
                sourceType={item.sourceType}
                sourceId={item.sourceId}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/${locale}/contenido?${buildQuery({ ...params, pagina: String(page - 1) })}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm"
              >
                ← Anterior
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            {hasNext && (
              <Link
                href={`/${locale}/contenido?${buildQuery({ ...params, pagina: String(page + 1) })}`}
                className="px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-sm"
              >
                Siguiente →
              </Link>
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
