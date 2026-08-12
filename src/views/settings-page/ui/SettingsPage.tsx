import { getTranslations } from "next-intl/server";
import { SendFeedbackForm } from "@/features/send-feedback";
import { ThemeSwitch } from "@/features/switch-theme";
import { PersonaSettingsPanel } from "@/widgets/persona-settings-panel";
import { SettingsSection } from "@/shared/ui/SettingsSection";
import styles from "./SettingsPage.module.scss";

export async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <PersonaSettingsPanel />
        <SettingsSection title={t("themeSectionTitle")}>
          <ThemeSwitch />
        </SettingsSection>
        <SettingsSection title={t("feedbackSectionTitle")}>
          <SendFeedbackForm />
        </SettingsSection>
      </div>
    </div>
  );
}
