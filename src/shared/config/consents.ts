export const CONSENT_TYPES = ["training_data", "not_a_replacement"] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

// Версия текста политики по каждому типу согласия. При правке текста политики
// поднять версию здесь — старое принятое согласие перестанет считаться действующим
// и будет показано пользователю повторно (см. ТЗ п.6.1, п.6.6).
export const CONSENT_POLICY_VERSIONS: Record<ConsentType, string> = {
  training_data: "1.0.0",
  not_a_replacement: "1.0.0",
};
