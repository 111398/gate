import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// RLS-scoped клиент для Server Components / Route Handlers / Server Actions —
// действует от имени текущего пользователя (сессия из cookies), не обходит RLS.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll вызван из Server Component без возможности записи cookies —
            // безопасно игнорировать, если рядом есть middleware, обновляющий сессию.
          }
        },
      },
    }
  );
}
