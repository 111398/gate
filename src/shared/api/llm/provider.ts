import "server-only";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Единая точка абстракции над LLM-провайдером — смена провайдера ограничивается
// этим файлом, остальной код зависит только от getChatModel()/getClassifierModel().
export function getChatModel(): LanguageModel {
  return groq("llama-3.3-70b-versatile");
}

// Отдельная модель для классификатора кризисных состояний (ТЗ п.6.5) — намеренно
// отделена от основной генерации: классификация должна быть быстрой и не должна
// конкурировать по стилю ответа с персоной. Структурированный вывод (response_format
// json_schema, через который classifyMessage получает строго типизированный уровень
// риска) на Groq сейчас поддерживают только модели openai/gpt-oss-*, поэтому здесь
// не llama, а gpt-oss-20b — см. https://console.groq.com/docs/structured-outputs.
export function getClassifierModel(): LanguageModel {
  return groq("openai/gpt-oss-20b");
}
