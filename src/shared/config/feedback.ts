export const FEEDBACK_TYPES = ["complaint", "suggestion"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  complaint: "Жалоба",
  suggestion: "Предложение",
};

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;
export const FEEDBACK_DAILY_LIMIT = 5;
