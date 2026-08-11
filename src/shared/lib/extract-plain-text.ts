function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, out));
  }
}

// Экспорты переписки (chat_export) бывают в JSON — формат зависит от мессенджера
// и не специфицирован в ТЗ. Для MVP: если это валидный JSON, рекурсивно достаём все
// строковые значения (сообщения, имена отправителей и т.п.) построчно; иначе — берём
// содержимое как есть (txt).
export function extractPlainText(rawContent: string, fileType: "chat_export" | "text_note"): string {
  if (fileType !== "chat_export") return rawContent;

  const trimmed = rawContent.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return rawContent;

  try {
    const parsed = JSON.parse(trimmed);
    const lines: string[] = [];
    collectStrings(parsed, lines);
    return lines.join("\n");
  } catch {
    return rawContent;
  }
}
