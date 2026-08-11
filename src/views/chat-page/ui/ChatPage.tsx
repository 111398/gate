"use client";

import { useState } from "react";
import { ChatWindow } from "@/widgets/chat-window";
import { FileUploadPanel } from "@/widgets/file-upload-panel";
import { Button } from "@/shared/ui/Button";
import styles from "./ChatPage.module.scss";

export function ChatPage() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <Button variant="secondary" onPress={() => setShowUpload((value) => !value)}>
          {showUpload ? "Скрыть материалы" : "Загрузить материалы"}
        </Button>
      </div>

      {showUpload && (
        <div className={styles.uploadSection}>
          <FileUploadPanel />
        </div>
      )}

      <div className={styles.chatSection}>
        <ChatWindow />
      </div>
    </div>
  );
}
