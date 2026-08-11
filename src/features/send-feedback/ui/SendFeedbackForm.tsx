"use client";

import { useState, type FormEvent } from "react";
import { trpc } from "@/shared/api/trpc/client";
import { FEEDBACK_MESSAGE_MAX_LENGTH, FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES } from "@/shared/config/feedback";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import styles from "./SendFeedbackForm.module.scss";

const TYPE_OPTIONS = FEEDBACK_TYPES.map((type) => ({ id: type, label: FEEDBACK_TYPE_LABELS[type] }));

export function SendFeedbackForm() {
  const [type, setType] = useState<string>(FEEDBACK_TYPES[0]);
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

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
      <Select label="Тип обращения" options={TYPE_OPTIONS} selectedKey={type} onSelectionChange={setType} />

      <label className={styles.textareaField}>
        <span className={styles.textareaLabel}>Сообщение</span>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
          rows={5}
          placeholder="Опишите проблему или идею…"
        />
      </label>

      {mutation.isError && (
        <p className={styles.error} role="alert">
          {mutation.error.message}
        </p>
      )}
      {isSent && (
        <p className={styles.success} role="status">
          Спасибо! Обращение отправлено.
        </p>
      )}

      <Button type="submit" isDisabled={mutation.isPending || !message.trim()}>
        {mutation.isPending ? "Отправляем…" : "Отправить"}
      </Button>
    </form>
  );
}
