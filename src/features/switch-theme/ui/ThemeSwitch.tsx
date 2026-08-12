"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Switch } from "@/shared/ui/Switch";
import { THEME_STORAGE_KEY, type Theme } from "@/shared/config/theme";
import styles from "./ThemeSwitch.module.scss";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Единственный источник изменений — наш собственный onChange ниже, поэтому
// достаточно локального pub-sub вместо storage-события.
function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeSwitch() {
  const t = useTranslations("Settings");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleChange(isDark: boolean) {
    const next: Theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    listeners.forEach((listener) => listener());
  }

  return (
    <div className={styles.wrapper}>
      <span className={theme === "light" ? styles.activeLabel : styles.label}>{t("themeLight")}</span>
      <Switch
        isSelected={theme === "dark"}
        onChange={handleChange}
        aria-label={t("themeSectionTitle")}
      />
      <span className={theme === "dark" ? styles.activeLabel : styles.label}>{t("themeDark")}</span>
    </div>
  );
}
