"use client";

import { ChatWindow } from "@/widgets/chat-window";
import styles from "./ChatPage.module.scss";

export function ChatPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.chatSection}>
        <ChatWindow />
      </div>
    </div>
  );
}
