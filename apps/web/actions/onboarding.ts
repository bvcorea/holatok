"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

// ─── Step 1: Interests ────────────────────────────────────────

const interestsSchema = z.object({
  interests: z
    .array(z.enum(["KPOP", "KDRAMA", "KBEAUTY", "KFOOD", "KTRAVEL"]))
    .min(1, "Selecciona al menos un interés"),
});

export type InterestsState = {
  error?: string;
  success?: boolean;
};

export async function saveInterests(
  _prev: InterestsState,
  formData: FormData
): Promise<InterestsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const rawInterests = formData.getAll("interests") as string[];
  const parsed = interestsSchema.safeParse({ interests: rawInterests });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const userId = session.user.id;

  // Upsert interests (delete old, create new)
  await prisma.$transaction([
    prisma.userInterest.deleteMany({ where: { userId } }),
    prisma.userInterest.createMany({
      data: parsed.data.interests.map((category) => ({ userId, category })),
    }),
  ]);

  return { success: true };
}

// ─── Step 2: Profile ─────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
});

export type ProfileState = {
  error?: string;
  success?: boolean;
};

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const userId = session.user.id;
  const { name, bio, location } = parsed.data;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { name },
    }),
    prisma.profile.upsert({
      where: { userId },
      update: { bio: bio ?? null, location: location ?? null },
      create: { userId, bio: bio ?? null, location: location ?? null },
    }),
  ]);

  return { success: true };
}

// ─── Mark onboarding complete (redirect) ────────────────────

export async function completeOnboarding() {
  const locale = await getLocale();
  redirect(`/${locale}`);
}
