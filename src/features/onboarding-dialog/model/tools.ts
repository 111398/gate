import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildUpdatePersonaProfileTool } from "@/entities/persona/api/update-profile-tool";
import { INTERACTION_FREQUENCIES } from "@/shared/config/persona";

export function buildOnboardingTools({
  supabase,
  personaId,
}: {
  supabase: SupabaseClient;
  personaId: string;
}) {
  return {
    updatePersonaProfile: buildUpdatePersonaProfileTool({ supabase, personaId }),

    completeOnboarding: tool({
      description:
        "Завершить онбординг: сохранить желаемую частоту проактивных сообщений и перевести персону в активный статус. Вызывать один раз, когда все пять задач онбординга выполнены.",
      inputSchema: z.object({
        interactionFrequency: z.enum(INTERACTION_FREQUENCIES),
      }),
      execute: async ({ interactionFrequency }) => {
        const { error } = await supabase
          .from("personas")
          .update({ interaction_frequency: interactionFrequency, status: "active" })
          .eq("id", personaId);

        if (error) return { completed: false, reason: error.message };
        return { completed: true };
      },
    }),
  };
}
