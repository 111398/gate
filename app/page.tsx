import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";

// Персона появится в этапе 4 — тогда сюда добавится ветвление /onboarding vs /chat
// по personas.status. Пока после входа всегда ведём в онбординг.
export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/onboarding" : "/login");
}
