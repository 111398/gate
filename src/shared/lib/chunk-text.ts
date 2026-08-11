const TARGET_CHUNK_CHARS = 1500;
const HARD_MAX_UNIT_CHARS = 4000;
const OVERLAP_UNITS = 1;

function hardSplit(unit: string): string[] {
  if (unit.length <= HARD_MAX_UNIT_CHARS) return [unit];
  const parts: string[] = [];
  for (let i = 0; i < unit.length; i += HARD_MAX_UNIT_CHARS) {
    parts.push(unit.slice(i, i + HARD_MAX_UNIT_CHARS));
  }
  return parts;
}

function splitIntoUnits(text: string): string[] {
  const byBlankLine = text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Экспорты переписки часто идут построчно, без пустых строк-разделителей —
  // в этом случае делим по одиночным переносам (одна строка = одно сообщение).
  const units = byBlankLine.length > 1 ? byBlankLine : text.split(/\n/).map((s) => s.trim()).filter(Boolean);

  return units.flatMap(hardSplit);
}

// Несколько сообщений/абзацев на чанк, с перекрытием в OVERLAP_UNITS единиц —
// см. ТЗ п.6.3.
export function chunkText(text: string): string[] {
  const units = splitIntoUnits(text);
  if (units.length === 0) return [];

  const chunks: string[] = [];
  let current: string[] = [];
  let currentLength = 0;

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    current.push(unit);
    currentLength += unit.length;

    if (currentLength >= TARGET_CHUNK_CHARS || i === units.length - 1) {
      chunks.push(current.join("\n\n"));
      current = current.slice(-OVERLAP_UNITS);
      currentLength = current.reduce((sum, u) => sum + u.length, 0);
    }
  }

  return chunks;
}
