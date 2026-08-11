export const TRAINING_FILE_TYPES = ["chat_export", "text_note"] as const;
export type TrainingFileType = (typeof TRAINING_FILE_TYPES)[number];

export const TRAINING_FILE_TYPE_LABELS: Record<TrainingFileType, string> = {
  chat_export: "Экспорт переписки (.txt/.json)",
  text_note: "Заметка",
};
