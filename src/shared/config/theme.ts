export const THEME_STORAGE_KEY = "gate:theme";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
