import { prisma } from "../index";
import type { KCategory, Locale, Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 12;

export interface ContentListParams {
  category?: KCategory;
  locale?: Locale;
  page?: number;
  search?: string;
}

export async function getContents(params: ContentListParams = {}) {
  const { category, locale, page = 1, search } = params;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Prisma.ContentWhereInput = {
    published: true,
    ...(category && { category }),
    ...(locale && { locale }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { titleEs: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { viewCount: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        _count: { select: { likes: true, bookmarks: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    hasNext: page * ITEMS_PER_PAGE < total,
  };
}

export async function getContentById(id: string) {
  return prisma.content.findUnique({
    where: { id },
    include: {
      _count: { select: { likes: true, bookmarks: true } },
    },
  });
}

export async function getUserLikesAndBookmarks(
  userId: string,
  contentIds: string[]
) {
  const [likes, bookmarks] = await Promise.all([
    prisma.contentLike.findMany({
      where: { userId, contentId: { in: contentIds } },
      select: { contentId: true },
    }),
    prisma.bookmark.findMany({
      where: { userId, contentId: { in: contentIds } },
      select: { contentId: true },
    }),
  ]);

  return {
    likedIds: new Set(likes.map((l) => l.contentId)),
    bookmarkedIds: new Set(bookmarks.map((b) => b.contentId)),
  };
}

export async function toggleLike(userId: string, contentId: string) {
  const existing = await prisma.contentLike.findUnique({
    where: { userId_contentId: { userId, contentId } },
  });

  if (existing) {
    await prisma.contentLike.delete({
      where: { userId_contentId: { userId, contentId } },
    });
    return { liked: false };
  }

  await prisma.contentLike.create({ data: { userId, contentId } });
  return { liked: true };
}

export async function toggleBookmark(userId: string, contentId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_contentId: { userId, contentId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_contentId: { userId, contentId } },
    });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, contentId } });
  return { bookmarked: true };
}

export async function incrementViewCount(id: string) {
  await prisma.content.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}
