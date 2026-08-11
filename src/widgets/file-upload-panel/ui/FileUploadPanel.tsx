"use client";

import { UploadTrainingFileForm } from "@/features/upload-training-file";
import { trpc } from "@/shared/api/trpc/client";
import { TRAINING_FILE_TYPE_LABELS, type TrainingFileType } from "@/shared/config/training-file";
import styles from "./FileUploadPanel.module.scss";

export function FileUploadPanel() {
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
              <span>{TRAINING_FILE_TYPE_LABELS[file.file_type as TrainingFileType]}</span>
              <span className={file.processed ? styles.statusDone : styles.statusPending}>
                {file.processed ? "обработан" : "обрабатывается…"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
