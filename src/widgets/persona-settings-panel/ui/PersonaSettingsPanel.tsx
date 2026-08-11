"use client";

import { CONSENT_TEXTS } from "@/entities/consent";
import { DeletePersonaButton } from "@/features/delete-persona";
import { InteractionFrequencySelect } from "@/features/set-interaction-frequency";
import { trpc } from "@/shared/api/trpc/client";
import type { ConsentType } from "@/shared/config/consents";
import styles from "./PersonaSettingsPanel.module.scss";

export function PersonaSettingsPanel() {
  const { data: persona, isLoading: isPersonaLoading } = trpc.persona.getCurrent.useQuery();
  const { data: consents } = trpc.consents.list.useQuery();

  if (isPersonaLoading || !persona) {
    return <p className={styles.status}>Загрузка…</p>;
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Персона</h2>
        <p className={styles.personaName}>{persona.name || "Без имени"}</p>
        <InteractionFrequencySelect value={persona.interaction_frequency} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Согласия</h2>
        <ul className={styles.consentList}>
          {(consents ?? []).map((consent) => (
            <li key={`${consent.consent_type}-${consent.accepted_at}`} className={styles.consentItem}>
              <span>{CONSENT_TEXTS[consent.consent_type as ConsentType].title}</span>
              <span className={styles.consentDate}>
                {new Date(consent.accepted_at).toLocaleDateString("ru-RU")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Опасная зона</h2>
        <DeletePersonaButton />
      </section>
    </div>
  );
}
