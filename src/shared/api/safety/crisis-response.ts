import "server-only";
import { getTranslations } from "next-intl/server";
import { CRISIS_HOTLINE_NUMBER } from "@/shared/config/safety";

// Фиксированный, НЕ генерируемый LLM ответ — см. ТЗ п.6.5 и нефункциональное
// требование п.11: кризисная ветка не должна зависеть от того, что модель
// "правильно себя поведёт". Текст локализуется через словари i18n (Safety.crisisResponse),
// контакты помощи не хардкожены под одну страну — см. ТЗ п.9.
export async function getCrisisResponseText(): Promise<string> {
  const t = await getTranslations("Safety");
  return t("crisisResponse", { hotline: CRISIS_HOTLINE_NUMBER });
}
