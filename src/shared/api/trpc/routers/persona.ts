import type { Persona } from "@/entities/persona";
import { protectedProcedure, router } from "../trpc";

export const personaRouter = router({
  // Единственная персона на пользователя в MVP — получить существующую
  // или создать пустую (заполняется по ходу онбординг-диалога).
  getCurrent: protectedProcedure.query(async ({ ctx }): Promise<Persona> => {
    const { data: existing, error: selectError } = await ctx.supabase
      .from("personas")
      .select("*")
      .eq("user_id", ctx.user.id)
      .maybeSingle();

    if (selectError) throw new Error(selectError.message);
    if (existing) return existing as Persona;

    const { data: created, error: insertError } = await ctx.supabase
      .from("personas")
      .insert({ user_id: ctx.user.id, name: "" })
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);
    return created as Persona;
  }),
});
