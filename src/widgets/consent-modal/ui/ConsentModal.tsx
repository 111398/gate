"use client";

import { Modal, ModalOverlay, Dialog, Heading } from "react-aria-components";
import { useTranslations } from "next-intl";
import { AcceptConsentForm, useMissingConsents } from "@/features/accept-consent";
import styles from "./ConsentModal.module.scss";

// Немодально закрыть нельзя: isDismissable отсутствует, Escape/клик по фону не работают.
// Пока оба согласия не приняты (или актуализированы после смены policy_version),
// остальной интерфейс недоступен — см. ТЗ п.6.1, п.6.6.
export function ConsentModal() {
  const t = useTranslations("Consents");
  const { isLoading, hasMissingConsents, missingTypes } = useMissingConsents();

  if (isLoading || !hasMissingConsents) return null;

  return (
    <ModalOverlay isOpen className={styles.overlay}>
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog}>
          <Heading slot="title" className={styles.title}>
            {t("modalTitle")}
          </Heading>
          <p className={styles.intro}>{t("modalIntro")}</p>
          <AcceptConsentForm missingTypes={missingTypes} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
