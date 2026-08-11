"use client";

import { Modal, ModalOverlay, Dialog, Heading } from "react-aria-components";
import { AcceptConsentForm, useMissingConsents } from "@/features/accept-consent";
import styles from "./ConsentModal.module.scss";

// Немодально закрыть нельзя: isDismissable отсутствует, Escape/клик по фону не работают.
// Пока оба согласия не приняты (или актуализированы после смены policy_version),
// остальной интерфейс недоступен — см. ТЗ п.6.1, п.6.6.
export function ConsentModal() {
  const { isLoading, hasMissingConsents, missingTypes } = useMissingConsents();

  if (isLoading || !hasMissingConsents) return null;

  return (
    <ModalOverlay isOpen className={styles.overlay}>
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog}>
          <Heading slot="title" className={styles.title}>
            Прежде чем продолжить
          </Heading>
          <p className={styles.intro}>
            Для использования Gate нужно подтвердить два согласия. Оба обязательны.
          </p>
          <AcceptConsentForm missingTypes={missingTypes} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
