import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./Hero.module.scss";

export async function Hero() {
  const t = await getTranslations("Landing.hero");

  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <h1 className={styles.greeting}>{t("greeting")}</h1>
        <p className={styles.intro}>{t("intro")}</p>
        <p className={styles.disclaimer}>{t("disclaimer")}</p>

        <Link href="/register" className={styles.cta}>
          {t("cta")}
        </Link>

        <p className={styles.switchLink}>
          {t("haveAccount")} <Link href="/login">{t("signInLink")}</Link>
        </p>
      </div>
    </section>
  );
}
