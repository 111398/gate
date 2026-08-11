import "server-only";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

// Синтезирует ответ в том же протоколе, что и обычная LLM-стриминг генерация,
// но БЕЗ обращения к модели — текст целиком фиксирован заранее (см. ТЗ п.6.5, п.11).
export function createFixedTextStreamResponse(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: "fixed" });
      writer.write({ type: "text-delta", id: "fixed", delta: text });
      writer.write({ type: "text-end", id: "fixed" });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
