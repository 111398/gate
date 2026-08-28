import { getTranslations } from "next-intl/server";
import styles from "./HowItWorks.module.scss";

interface Step {
  title: string;
  body: string;
}

export async function HowItWorks() {
  const t = await getTranslations("Landing.howItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="how-it-works" className={styles.section}>
      <h2 className={styles.title}>{t("title")}</h2>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
