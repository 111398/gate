"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/shared/api/trpc/client";
import { TRAINING_FILE_TYPES } from "@/shared/config/training-file";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import styles from "./UploadTrainingFileForm.module.scss";

export function UploadTrainingFileForm() {
  const t = useTranslations("TrainingFiles");
  const utils = trpc.useUtils();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>(TRAINING_FILE_TYPES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileTypeOptions = TRAINING_FILE_TYPES.map((type) => ({
    id: type,
    label: t(`types.${type}`),
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError(t("noFileError"));
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    try {
      const response = await fetch("/api/ingest", { method: "POST", body: formData });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? t("uploadError"));
        return;
      }
      setFile(null);
      await utils.trainingFiles.list.invalidate();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Select
        label={t("typeLabel")}
        options={fileTypeOptions}
        selectedKey={fileType}
        onSelectionChange={setFileType}
      />

      <label className={styles.fileField}>
        <span className={styles.fileLabel}>{t("fileLabel")}</span>
        <input
          className={styles.fileInput}
          type="file"
          accept=".txt,.json"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" isDisabled={isUploading || !file}>
        {isUploading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
