export const TRAINING_FILE_TYPES = ["chat_export", "text_note"] as const;
export type TrainingFileType = (typeof TRAINING_FILE_TYPES)[number];
