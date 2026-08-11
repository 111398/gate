import "server-only";
import { createClient } from "@supabase/supabase-js";

// Сервисная роль — обходит RLS. Только для доверенного серверного кода
// (RAG-конвейер /api/ingest, каскадное удаление персоны, чтение feedback).
// Никогда не импортировать в клиентские компоненты и не передавать ключ в браузер.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
