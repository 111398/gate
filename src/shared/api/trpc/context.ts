import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";

export async function createTRPCContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
