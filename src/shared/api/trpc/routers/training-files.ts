import { protectedProcedure, router } from "../trpc";

export const trainingFilesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data: persona, error: personaError } = await ctx.supabase
      .from("personas")
      .select("id")
      .eq("user_id", ctx.user.id)
      .maybeSingle();

    if (personaError) throw new Error(personaError.message);
    if (!persona) return [];

    const { data, error } = await ctx.supabase
      .from("training_files")
      .select("id, file_type, storage_path, processed, created_at")
      .eq("persona_id", persona.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }),
});
