import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getClassifierModel } from "@/shared/api/llm/provider";
import { SAFETY_LEVELS, type SafetyLevel } from "@/shared/config/safety";

const classificationSchema = z.object({
  level: z.enum(SAFETY_LEVELS),
});

const CLASSIFIER_INSTRUCTIONS = `Ты — классификатор сообщений в приложении для людей, переживающих утрату
близкого человека. Твоя единственная задача — определить уровень риска в сообщении пользователя. Не веди
диалог, не отвечай на сообщение по существу, только классифицируй.

Три уровня:
- "acute_crisis" — прямые или косвенные признаки острого кризиса: суицидальные мысли или намерения,
  описание конкретного плана причинить себе вред, высказывания о нежелании жить прямо сейчас, описание
  неминуемой опасности для жизни (своей или чужой).
- "mild_distress" — грусть, тоска по умершему, тяжёлые эмоции, слёзы, усталость от горя — но БЕЗ прямых
  признаков острого кризиса выше.
- "none" — нейтральное сообщение без выраженного дистресса (вопрос, бытовой разговор, воспоминание).

При малейшем сомнении между "acute_crisis" и "mild_distress" — выбирай "acute_crisis": ложное срабатывание
безопаснее пропуска реального кризиса.`;

export async function classifyMessage(text: string): Promise<SafetyLevel> {
  const { object } = await generateObject({
    model: getClassifierModel(),
    schema: classificationSchema,
    instructions: CLASSIFIER_INSTRUCTIONS,
    prompt: text,
  });
  return object.level;
}
