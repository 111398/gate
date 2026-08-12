import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildUpdatePersonaProfileTool } from "@/entities/persona/api/update-profile-tool";

export function buildSupplementTools({
  supabase,
  personaId,
}: {
  supabase: SupabaseClient;
  personaId: string;
}) {
  return {
    updatePersonaProfile: buildUpdatePersonaProfileTool({ supabase, personaId }),

    finishTrainingSession: tool({
      description:
        "Завершить сессию дополнения данных о персоне. Вызывать один раз, только когда пользователь явно подтвердил, что больше нечего добавить.",
      inputSchema: z.object({}),
      execute: async () => ({ finished: true }),
    }),
  };
}
