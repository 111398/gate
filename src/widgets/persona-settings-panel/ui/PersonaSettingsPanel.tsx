"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { DeletePersonaButton } from "@/features/delete-persona";
import { InteractionFrequencySelect } from "@/features/set-interaction-frequency";
import { trpc } from "@/shared/api/trpc/client";
import type { ConsentType } from "@/shared/config/consents";
import { SettingsSection } from "@/shared/ui/SettingsSection";
import styles from "./PersonaSettingsPanel.module.scss";

export function PersonaSettingsPanel() {
  const t = useTranslations("Settings");
  const tConsents = useTranslations("Consents");
  const tChat = useTranslations("Chat");
  const format = useFormatter();
  const { data: persona, isLoading: isPersonaLoading } = trpc.persona.getCurrent.useQuery();
  const { data: consents } = trpc.consents.list.useQuery();

  if (isPersonaLoading || !persona) {
    return <p className={styles.status}>{tChat("loading")}</p>;
  }

  return (
    <>
      <SettingsSection title={t("personaSectionTitle")}>
        <p className={styles.personaName}>{persona.name || t("personaNoName")}</p>
        <InteractionFrequencySelect value={persona.interaction_frequency} />
        <Link href="/settings/train" className={styles.trainLink}>
          {t("supplementPersona")}
        </Link>
      </SettingsSection>

      <SettingsSection title={t("consentsSectionTitle")}>
        <ul className={styles.consentList}>
          {(consents ?? []).map((consent) => (
            <li key={`${consent.consent_type}-${consent.accepted_at}`} className={styles.consentItem}>
              <span>{tConsents(`types.${consent.consent_type as ConsentType}.title`)}</span>
              <span className={styles.consentDate}>{format.dateTime(new Date(consent.accepted_at))}</span>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <SettingsSection title={t("dangerZoneTitle")}>
        <DeletePersonaButton />
      </SettingsSection>
    </>
  );
}
