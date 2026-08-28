import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitch } from "@/features/switch-locale";
import type { Locale } from "@/shared/config/i18n";
import styles from "./Nav.module.scss";

export async function Nav() {
  const t = await getTranslations("Landing.nav");
  const tLayout = await getTranslations("Layout");
  const locale = await getLocale();

  return (
    <header className={styles.nav}>
      <span className={styles.brand}>{tLayout("brand")}</span>
      <div className={styles.actions}>
        <LocaleSwitch locale={locale as Locale} />
        <Link href="/login" className={styles.loginLink}>
          {t("login")}
        </Link>
      </div>
    </header>
  );
}
