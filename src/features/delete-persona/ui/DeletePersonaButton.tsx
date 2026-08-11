"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { trpc } from "@/shared/api/trpc/client";
import { Button } from "@/shared/ui/Button";
import styles from "./DeletePersonaButton.module.scss";

export function DeletePersonaButton() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);

  const mutation = trpc.persona.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.persona.invalidate(),
        utils.trainingFiles.invalidate(),
        utils.messages.invalidate(),
      ]);
      router.replace("/onboarding");
    },
  });

  return (
    <>
      <Button variant="danger" onPress={() => setIsOpen(true)}>
        Удалить персону
      </Button>

      <ModalOverlay isOpen={isOpen} onOpenChange={setIsOpen} isDismissable className={styles.overlay}>
        <Modal className={styles.modal}>
          <Dialog className={styles.dialog}>
            <Heading slot="title" className={styles.title}>
              Удалить персону безвозвратно?
            </Heading>
            <p className={styles.body}>
              Будут удалены все загруженные материалы, память персоны и вся история переписки. Это действие
              необратимо.
            </p>

            {mutation.isError && (
              <p className={styles.error} role="alert">
                Не удалось удалить. Попробуйте ещё раз.
              </p>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onPress={() => setIsOpen(false)} isDisabled={mutation.isPending}>
                Отмена
              </Button>
              <Button variant="danger" onPress={() => mutation.mutate()} isDisabled={mutation.isPending}>
                {mutation.isPending ? "Удаляем…" : "Удалить безвозвратно"}
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
