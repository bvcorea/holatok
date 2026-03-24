"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/commerce/CartDrawer";

export function Navbar() {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <span className="text-[#FF6B6B]">Hola</span>
          <span className="text-[#4A90D9]">Talk</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href={`/${locale}/contenido`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("content")}
          </Link>
          <Link
            href={`/${locale}/chat`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("chat")}
          </Link>
          <Link
            href={`/${locale}/viajes`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("travel")}
          </Link>
          <Link
            href={`/${locale}/tienda`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("shop")}
          </Link>
          <Link
            href={`/${locale}/comunidad`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("community")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <CartDrawer />
          {session ? (
            <>
              <Link href={`/${locale}/perfil`}>
                <Button variant="ghost" size="sm">
                  {session.user?.name?.split(" ")[0] ?? t("profile")}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
              >
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`}>
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button variant="coral" size="sm">
                  {t("register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
