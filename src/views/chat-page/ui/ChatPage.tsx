import { FileUploadPanel } from "@/widgets/file-upload-panel";
import styles from "./ChatPage.module.scss";

// Сам чат с персоной и RAG-поиском появится в этапе 6 — пока страница отвечает
// за первый шаг после онбординга: загрузку материалов для обучения персоны.
export function ChatPage() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.intro}>
        Загрузите переписку или заметки о человеке — на их основе строится память персоны.
        Диалог с ней появится на следующем этапе.
      </p>
      <FileUploadPanel />
    </div>
  );
}
