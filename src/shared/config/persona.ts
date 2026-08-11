export const INTERACTION_FREQUENCIES = ["daily", "few_times_week", "weekly", "manual"] as const;
export type InteractionFrequency = (typeof INTERACTION_FREQUENCIES)[number];

export const INTERACTION_FREQUENCY_LABELS: Record<InteractionFrequency, string> = {
  daily: "Каждый день",
  few_times_week: "Несколько раз в неделю",
  weekly: "Раз в неделю",
  manual: "Только когда я сам напишу",
};

export const PERSONA_STATUSES = ["onboarding", "training", "active", "deleted"] as const;
export type PersonaStatus = (typeof PERSONA_STATUSES)[number];

// Технический маркер первого сообщения, которым клиент запускает диалог без
// участия пользователя (персона должна заговорить первой). В истории/БД не сохраняется.
export const CHAT_KICKOFF_MARKER = "__gate_start__";
