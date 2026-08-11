import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendSupportEmail } from "@/shared/api/email/send-support-email";
import { checkFeedbackRateLimit } from "@/shared/api/rate-limit/feedback-limiter";
import { FEEDBACK_MESSAGE_MAX_LENGTH, FEEDBACK_TYPES } from "@/shared/config/feedback";
import { protectedProcedure, router } from "../trpc";

export const feedbackRouter = router({
  send: protectedProcedure
    .input(
      z.object({
        type: z.enum(FEEDBACK_TYPES),
        message: z
          .string()
          .trim()
          .min(1, "Сообщение не может быть пустым")
          .max(FEEDBACK_MESSAGE_MAX_LENGTH, `Сообщение не может быть длиннее ${FEEDBACK_MESSAGE_MAX_LENGTH} символов`),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowed = await checkFeedbackRateLimit(ctx.user.id);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Превышен дневной лимит обращений. Попробуйте завтра.",
        });
      }

      // Источник истины внутри системы — таблица feedback, независимо от доставки письма
      // (см. ТЗ п.6.8).
      const { error } = await ctx.supabase.from("feedback").insert({
        user_id: ctx.user.id,
        type: input.type,
        message: input.message,
      });

      if (error) throw new Error(error.message);

      try {
        await sendSupportEmail({
          type: input.type,
          message: input.message,
          userEmail: ctx.user.email ?? "",
        });
      } catch (emailError) {
        console.error("Failed to send support email:", emailError);
      }

      return { success: true };
    }),
});
