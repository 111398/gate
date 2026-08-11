import { z } from "zod";
import { CONSENT_POLICY_VERSIONS, CONSENT_TYPES } from "@/shared/config/consents";
import { protectedProcedure, router } from "../trpc";

export const consentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("consents")
      .select("consent_type, policy_version, accepted_at")
      .eq("user_id", ctx.user.id)
      .order("accepted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }),

  accept: protectedProcedure
    .input(z.object({ consentType: z.enum(CONSENT_TYPES) }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from("consents").insert({
        user_id: ctx.user.id,
        consent_type: input.consentType,
        policy_version: CONSENT_POLICY_VERSIONS[input.consentType],
      });

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
