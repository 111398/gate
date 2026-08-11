import { z } from "zod";
import type { Persona } from "@/entities/persona";
import { INTERACTION_FREQUENCIES } from "@/shared/config/persona";
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

  setInteractionFrequency: protectedProcedure
    .input(z.object({ interactionFrequency: z.enum(INTERACTION_FREQUENCIES) }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("personas")
        .update({ interaction_frequency: input.interactionFrequency })
        .eq("user_id", ctx.user.id);

      if (error) throw new Error(error.message);
      return { success: true };
    }),

  // Каскад training_files/messages/memory_chunks/consents идёт через FK on delete
  // cascade (см. 0001_init.sql) — атомарно одним DELETE. Файлы в Storage удаляются
  // отдельно перед этим: FK cascade их не касается, это не строки в БД.
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: persona, error: personaError } = await ctx.supabase
      .from("personas")
      .select("id")
      .eq("user_id", ctx.user.id)
      .maybeSingle();

    if (personaError) throw new Error(personaError.message);
    if (!persona) return { success: true };

    const { data: files } = await ctx.supabase
      .from("training_files")
      .select("storage_path")
      .eq("persona_id", persona.id);

    if (files && files.length > 0) {
      const { error: storageError } = await ctx.supabase.storage
        .from("training-files")
        .remove(files.map((file) => file.storage_path));
      if (storageError) {
        // Не блокируем удаление персональных данных из БД из-за сбоя Storage —
        // но не молчим о нём.
        console.error("Failed to remove training files from storage:", storageError.message);
      }
    }

    const { error: deleteError } = await ctx.supabase.from("personas").delete().eq("id", persona.id);
    if (deleteError) throw new Error(deleteError.message);

    return { success: true };
  }),
});
