import { TRPCProvider } from "./trpc-provider";

// SupabaseProvider и IntlProvider подключаются на соответствующих этапах
// (см. src/app/providers/trpc-provider.tsx как образец).
export function Providers({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
