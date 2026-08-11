import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/shared/config/i18n";

// Без [locale]-роутинга: RU — единственная активная локаль в MVP (см. ТЗ п.9),
// EN-словарь подготовлен и лежит рядом, переключение — вопрос смены DEFAULT_LOCALE
// и подключения роутинга/переключателя, без переписывания компонентов.
export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
