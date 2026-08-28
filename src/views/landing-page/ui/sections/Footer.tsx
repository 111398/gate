import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./Footer.module.scss";

export async function Footer() {
  const t = await getTranslations("Landing.footer");
  const tLayout = await getTranslations("Layout");
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>{tLayout("brand")}</span>
          <p className={styles.tagline}>{t("tagline")}</p>
        </div>
        <nav className={styles.nav}>
          <a href="#how-it-works" className={styles.navLink}>
            {t("navHowItWorks")}
          </a>
          <a href="#faq" className={styles.navLink}>
            {t("navFaq")}
          </a>
          <Link href="/login" className={styles.navLink}>
            {t("navLogin")}
          </Link>
        </nav>
      </div>
      <p className={styles.copyright}>{t("copyright", { year })}</p>
    </footer>
  );
}
