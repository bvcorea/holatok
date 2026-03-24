import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no Prisma / no Node-only libs)
export const authConfig = {
  pages: {
    signIn: "/es/auth/login",
    newUser: "/es/auth/register",
    error: "/es/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/perfil", "/pedidos", "/reservas", "/chat", "/onboarding"];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.includes(p)
      );
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
