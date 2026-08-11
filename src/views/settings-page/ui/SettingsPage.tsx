import { SendFeedbackForm } from "@/features/send-feedback";
import { PersonaSettingsPanel } from "@/widgets/persona-settings-panel";
import styles from "./SettingsPage.module.scss";

export function SettingsPage() {
  return (
    <div className={styles.wrapper}>
      <PersonaSettingsPanel />
      <section className={styles.feedbackSection}>
        <h2 className={styles.feedbackTitle}>Обратная связь</h2>
        <SendFeedbackForm />
      </section>
    </div>
  );
}
