"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { toUIMessages, usePersonaChat } from "@/features/send-message";
import { trpc } from "@/shared/api/trpc/client";
import { Button } from "@/shared/ui/Button";
import styles from "./ChatWindow.module.scss";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatWindow() {
  const { data: history, isLoading } = trpc.messages.getHistory.useQuery({ limit: 30 });

  if (isLoading || !history) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.status}>Загрузка…</p>
      </div>
    );
  }

  return <ChatWindowReady initialItems={history.items} />;
}

function ChatWindowReady({ initialItems }: { initialItems: Parameters<typeof toUIMessages>[0] }) {
  const [initialMessages] = useState(() => toUIMessages(initialItems));
  const { messages, sendMessage, status, error, clearError } = usePersonaChat(initialMessages);
  const [input, setInput] = useState("");
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const canSubmit = status === "ready" || status === "error";

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || !canSubmit) return;
    if (status === "error") clearError();
    sendMessage({ text: input });
    setInput("");
  }

  const lastMessage = messages[messages.length - 1];
  const isWaitingForAssistant =
    (status === "submitted" || status === "streaming") &&
    (!lastMessage || lastMessage.role === "user" || messageText(lastMessage.parts) === "");

  return (
    <div className={styles.wrapper}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.empty}>Напишите первое сообщение, чтобы начать разговор.</p>
        )}
        {messages.map((message) => {
          const text = messageText(message.parts);
          if (!text) return null;
          return (
            <div
              key={message.id}
              className={message.role === "user" ? styles.bubbleUser : styles.bubblePersona}
            >
              {text}
            </div>
          );
        })}
        {isWaitingForAssistant && (
          <div className={styles.bubblePersona} aria-live="polite">
            …
          </div>
        )}
        <div ref={scrollAnchorRef} />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          Не получилось получить ответ. Попробуйте отправить сообщение ещё раз.
        </p>
      )}

      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Напишите сообщение…"
          disabled={!canSubmit}
          aria-label="Сообщение"
        />
        <Button type="submit" isDisabled={!canSubmit || !input.trim()}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
