import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-coral">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-lg">{t("description")}</p>
        <a
          href="#"
          className="inline-block px-8 py-3 rounded-lg bg-seoul-blue text-white font-semibold hover:bg-seoul-blue-dark transition-colors"
        >
          {t("cta")}
        </a>
      </div>
    </main>
  );
}
