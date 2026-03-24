import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "es", "pt-BR"],
  defaultLocale: "ko",
});

export type Locale = (typeof routing.locales)[number];
