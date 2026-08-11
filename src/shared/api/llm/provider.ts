import "server-only";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Единая точка абстракции над LLM-провайдером — смена провайдера ограничивается
// этим файлом, остальной код зависит только от getChatModel().
export function getChatModel(): LanguageModel {
  return groq("llama-3.3-70b-versatile");
}
