import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TRPCProvider } from "./trpc-provider";

// SupabaseProvider подключается по необходимости (см. shared/api/supabase) —
// Supabase-клиенты создаются напрямую в местах использования, отдельный
// React-провайдер для них не потребовался.
export async function Providers({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <TRPCProvider>{children}</TRPCProvider>
    </NextIntlClientProvider>
  );
}
