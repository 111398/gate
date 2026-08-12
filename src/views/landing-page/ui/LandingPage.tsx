import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./LandingPage.module.scss";

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const tLayout = await getTranslations("Layout");

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.brand}>{tLayout("brand")}</h1>
        <h2 className={styles.greeting}>{t("greeting")}</h2>
        <p className={styles.intro}>{t("intro")}</p>
        <p className={styles.disclaimer}>{t("disclaimer")}</p>

        <Link href="/register" className={styles.cta}>
          {t("cta")}
        </Link>

        <p className={styles.switchLink}>
          {t("haveAccount")} <Link href="/login">{t("signInLink")}</Link>
        </p>
      </div>
    </main>
  );
}
