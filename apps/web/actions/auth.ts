"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@repo/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// ─── Schemas ────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  country: z.enum(["BR", "MX", "CO", "AR", "CL", "PE"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Register ────────────────────────────────────────────────

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos, verifica el formulario" };
  }

  const { name, email, password, country } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Este correo ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const localeByCountry: Record<string, "es" | "pt_BR" | "ko"> = {
    BR: "pt_BR",
    MX: "es",
    CO: "es",
    AR: "es",
    CL: "es",
    PE: "es",
  };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      country: country as "BR" | "MX" | "CO" | "AR" | "CL" | "PE",
      preferredLocale: localeByCountry[country] ?? "es",
      language: country === "BR" ? "pt" : "es",
    },
  });

  return { success: true };
}

// ─── Login ────────────────────────────────────────────────

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginUser(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Correo o contraseña inválidos" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Correo o contraseña incorrectos" };
      }
    }
    return { error: "Error del servidor, intenta de nuevo" };
  }
}
