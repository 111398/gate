"use client";

import { useTranslations } from "next-intl";
import { UploadTrainingFileForm } from "@/features/upload-training-file";
import { trpc } from "@/shared/api/trpc/client";
import type { TrainingFileType } from "@/shared/config/training-file";
import styles from "./FileUploadPanel.module.scss";

export function FileUploadPanel() {
  const t = useTranslations("TrainingFiles");
  const { data: files } = trpc.trainingFiles.list.useQuery(undefined, {
    refetchInterval: (query) => (query.state.data?.some((file) => !file.processed) ? 3000 : false),
  });

  return (
    <div className={styles.wrapper}>
      <UploadTrainingFileForm />

      {files && files.length > 0 && (
        <ul className={styles.list}>
          {files.map((file) => (
            <li key={file.id} className={styles.item}>
              <span>{t(`types.${file.file_type as TrainingFileType}`)}</span>
              <span className={file.processed ? styles.statusDone : styles.statusPending}>
                {file.processed ? t("statusProcessed") : t("statusPending")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
