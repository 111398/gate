"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Switch } from "@/shared/ui/Switch";
import type { Locale } from "@/shared/config/i18n";
import { setLocale } from "../model/actions";
import styles from "./LocaleSwitch.module.scss";

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const t = useTranslations("Layout");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(isEn: boolean) {
    const next: Locale = isEn ? "en" : "ru";
    if (next === locale) return;

    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.wrapper}>
        <span className={locale === "ru" ? styles.activeLabel : styles.label}>RU</span>
        <Switch
          isSelected={locale === "en"}
          onChange={handleChange}
          isDisabled={isPending}
          aria-label={t("localeSwitchLabel")}
        />
        <span className={locale === "en" ? styles.activeLabel : styles.label}>EN</span>
      </div>

      {isPending && (
        <div className={styles.overlay} role="status" aria-live="polite">
          <span className={styles.spinner} />
        </div>
      )}
    </>
  );
}
