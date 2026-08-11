import { getTranslations } from "next-intl/server";
import { SendFeedbackForm } from "@/features/send-feedback";
import { PersonaSettingsPanel } from "@/widgets/persona-settings-panel";
import styles from "./SettingsPage.module.scss";

export async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <div className={styles.wrapper}>
      <PersonaSettingsPanel />
      <section className={styles.feedbackSection}>
        <h2 className={styles.feedbackTitle}>{t("feedbackSectionTitle")}</h2>
        <SendFeedbackForm />
      </section>
    </div>
  );
}
