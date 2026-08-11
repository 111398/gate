"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/shared/api/trpc/client";
import { FEEDBACK_MESSAGE_MAX_LENGTH, FEEDBACK_TYPES } from "@/shared/config/feedback";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import styles from "./SendFeedbackForm.module.scss";

export function SendFeedbackForm() {
  const t = useTranslations("Feedback");
  const [type, setType] = useState<string>(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const typeOptions = FEEDBACK_TYPES.map((feedbackType) => ({
    id: feedbackType,
    label: t(`types.${feedbackType}`),
  }));

  const mutation = trpc.feedback.send.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsSent(true);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setIsSent(false);
    mutation.mutate({ type: type as (typeof FEEDBACK_TYPES)[number], message });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Select label={t("typeLabel")} options={typeOptions} selectedKey={type} onSelectionChange={setType} />

      <label className={styles.textareaField}>
        <span className={styles.textareaLabel}>{t("messageLabel")}</span>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
          rows={5}
          placeholder={t("messagePlaceholder")}
        />
      </label>

      {mutation.isError && (
        <p className={styles.error} role="alert">
          {mutation.error.message}
        </p>
      )}
      {isSent && (
        <p className={styles.success} role="status">
          {t("success")}
        </p>
      )}

      <Button type="submit" isDisabled={mutation.isPending || !message.trim()}>
        {mutation.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
