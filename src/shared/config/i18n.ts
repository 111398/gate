export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALE_COOKIE = "gate_locale";

// Системная локаль пользователя (Accept-Language) определяет язык при первом
// визите: ru -> ru, всё остальное (включая отсутствие заголовка) -> en.
export function pickDefaultLocale(acceptLanguageHeader: string | null): Locale {
  const primary = acceptLanguageHeader?.split(",")[0]?.trim().toLowerCase();
  return primary?.startsWith("ru") ? "ru" : "en";
}
