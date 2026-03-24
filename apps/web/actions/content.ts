"use server";

import { auth } from "@/auth";
import { toggleLike, toggleBookmark, incrementViewCount } from "@repo/db";
import { revalidatePath } from "next/cache";

export async function likeContent(contentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para dar like" };
  }

  const result = await toggleLike(session.user.id, contentId);
  revalidatePath("/[locale]/contenido", "page");
  return result;
}

export async function bookmarkContent(contentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para guardar contenido" };
  }

  const result = await toggleBookmark(session.user.id, contentId);
  revalidatePath("/[locale]/contenido", "page");
  return result;
}

export async function viewContent(contentId: string) {
  await incrementViewCount(contentId);
}
