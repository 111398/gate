// Разрешённые суффиксы домена почты при регистрации.
// Источник истины — сервер (Supabase Auth Hook), клиент дублирует только для мгновенной обратной связи.
export const ALLOWED_EMAIL_DOMAIN_SUFFIXES = [".ru"] as const;

export function isAllowedEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split("@").at(-1) ?? "";
  return ALLOWED_EMAIL_DOMAIN_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}
