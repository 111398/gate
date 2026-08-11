"use client";

import { useState } from "react";
import { CONSENT_TEXTS } from "@/entities/consent";
import { trpc } from "@/shared/api/trpc/client";
import type { ConsentType } from "@/shared/config/consents";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import styles from "./AcceptConsentForm.module.scss";

export function AcceptConsentForm({ missingTypes }: { missingTypes: ConsentType[] }) {
  const utils = trpc.useUtils();
  const [checked, setChecked] = useState<Partial<Record<ConsentType, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  const acceptMutation = trpc.consents.accept.useMutation();

  const allChecked = missingTypes.every((type) => checked[type]);

  async function handleSubmit() {
    setError(null);
    try {
      for (const consentType of missingTypes) {
        await acceptMutation.mutateAsync({ consentType });
      }
      await utils.consents.list.invalidate();
    } catch {
      setError("Не удалось сохранить согласие. Попробуйте ещё раз.");
    }
  }

  return (
    <div className={styles.wrapper}>
      {missingTypes.map((type) => (
        <div key={type} className={styles.item}>
          <Checkbox
            isSelected={!!checked[type]}
            onChange={(isSelected) => setChecked((prev) => ({ ...prev, [type]: isSelected }))}
          >
            <strong>{CONSENT_TEXTS[type].title}.</strong> {CONSENT_TEXTS[type].body}
          </Checkbox>
        </div>
      ))}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <Button
        onPress={handleSubmit}
        isDisabled={!allChecked || acceptMutation.isPending}
        className={styles.submit}
      >
        {acceptMutation.isPending ? "Сохраняем…" : "Продолжить"}
      </Button>
    </div>
  );
}
