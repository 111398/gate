import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./FinalCta.module.scss";

export async function FinalCta() {
  const t = await getTranslations("Landing.finalCta");

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t("title")}</h2>
      <p className={styles.body}>{t("body")}</p>
      <Link href="/register" className={styles.cta}>
        {t("cta")}
      </Link>
    </section>
  );
}
