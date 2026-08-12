import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const DEFAULT_PAGE_SIZE = 30;

export const messagesRouter = router({
  getHistory: protectedProcedure
    .input(
      z
        .object({
          cursor: z.string().nullish(),
          limit: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_PAGE_SIZE;

      const { data: persona, error: personaError } = await ctx.supabase
        .from("personas")
        .select("id")
        .eq("user_id", ctx.user.id)
        .maybeSingle();

      if (personaError) throw new Error(personaError.message);
      if (!persona) return { items: [], nextCursor: null as string | null };

      // 'onboarding' — сообщения онбординга и supplement-сессий из настроек, не
      // показываются в основном чате (см. app/api/chat/route.ts).
      let query = ctx.supabase
        .from("messages")
        .select("id, sender, content, is_safety_flagged, created_at")
        .eq("persona_id", persona.id)
        .eq("phase", "main")
        .order("created_at", { ascending: false })
        .limit(limit + 1);

      if (input?.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const hasMore = data.length > limit;
      const page = hasMore ? data.slice(0, limit) : data;
      const nextCursor = hasMore ? page[page.length - 1].created_at : null;

      // page приходит от новых к старым (для курсора) — разворачиваем в хронологический порядок для отображения.
      return { items: [...page].reverse(), nextCursor };
    }),
});
