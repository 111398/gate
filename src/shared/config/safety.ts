export const SAFETY_LEVELS = ["none", "mild_distress", "acute_crisis"] as const;
export type SafetyLevel = (typeof SAFETY_LEVELS)[number];

// Единый номер для всех локалей пока не различается по региону — при появлении
// реальной EN-аудитории потребуется карта локаль -> номер горячей линии
// (см. Safety.crisisResponse в словарях i18n).
export const CRISIS_HOTLINE_NUMBER = "8-800-2000-122";

// Мягкое напоминание при лёгком/умеренном дистрессе — периодически подмешивается
// в системный промпт персоны (не в каждом сообщении), см. buildPersonaSystemPrompt.
export const MILD_DISTRESS_REMINDER_PROBABILITY = 0.34;
