import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

// Общий tool для онбординга и последующего дообучения персоны из настроек —
// оба сценария ведут одинаковый разговор "узнать и сохранить деталь о персоне".
export function buildUpdatePersonaProfileTool({
  supabase,
  personaId,
}: {
  supabase: SupabaseClient;
  personaId: string;
}) {
  return tool({
    description:
      "Сохранить или обновить известные сведения о человеке, которому посвящена персона. Можно вызывать несколько раз по мере разговора, передавая только те поля, которые только что стали известны. Для characterNotes передавай полный обновлённый текст (старое + новое), а не только добавку.",
    inputSchema: z.object({
      name: z.string().min(1).optional().describe("Имя человека"),
      age: z.number().int().positive().max(130).optional().describe("Возраст"),
      relationship: z.string().min(1).optional().describe("Кем приходится пользователю, например «мама», «муж», «друг»"),
      characterNotes: z.string().min(1).optional().describe("Полное описание характера, привычек, манеры речи — с учётом уже известного"),
    }),
    execute: async (input) => {
      const patch: Record<string, string | number> = {};
      if (input.name) patch.name = input.name;
      if (input.age) patch.age = input.age;
      if (input.relationship) patch.relationship = input.relationship;
      if (input.characterNotes) patch.character_notes = input.characterNotes;

      if (Object.keys(patch).length === 0) {
        return { saved: false, reason: "Не передано ни одного поля" };
      }

      const { error } = await supabase.from("personas").update(patch).eq("id", personaId);
      if (error) return { saved: false, reason: error.message };
      return { saved: true, patch };
    },
  });
}
