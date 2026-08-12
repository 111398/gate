import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server-client";

// Supabase присылает в письме подтверждения ссылку вида /auth/callback?code=...
// (PKCE-флоу) — без обмена кода на сессию здесь пользователь остаётся неавторизован,
// даже попав на правильный домен. См. emailRedirectTo в SignUpForm.
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
