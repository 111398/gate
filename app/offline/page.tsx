import { getTranslations } from "next-intl/server";

// Отдаётся service worker'ом (public/sw.js) для навигационных запросов без сети —
// см. ТЗ п.10. Не должна зависеть от сессии/API, только статический текст.
export default async function OfflinePage() {
  const t = await getTranslations("Offline");

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>{t("title")}</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>{t("body")}</p>
      </div>
    </main>
  );
}
