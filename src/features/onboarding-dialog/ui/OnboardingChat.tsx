"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/shared/ui/Button";
import { CHAT_KICKOFF_MARKER } from "@/shared/config/persona";
import styles from "./OnboardingChat.module.scss";

function messageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function hasCompletedOnboardingTool(parts: { type: string; state?: string }[]): boolean {
  return parts.some((part) => part.type === "tool-completeOnboarding" && part.state === "output-available");
}

export function OnboardingChat({ onCompleted }: { onCompleted: () => void }) {
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const kickedOffRef = useRef(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kickedOffRef.current && messages.length === 0) {
      kickedOffRef.current = true;
      sendMessage({ text: CHAT_KICKOFF_MARKER });
    }
  }, [messages.length, sendMessage]);

  // Онбординг завершается инструментом completeOnboarding (см. app/api/chat/route.ts).
  // Ждём, пока модель дострит прощальную реплику (status === 'ready'), и только
  // после паузы, чтобы пользователь успел её прочитать, просим родителя перепроверить
  // статус персоны — переход на /chat делает OnboardingPage по реальному статусу из БД,
  // а не этот компонент по факту получения tool-части.
  useEffect(() => {
    if (status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !hasCompletedOnboardingTool(last.parts)) return;

    const timeout = setTimeout(onCompleted, 1500);
    return () => clearTimeout(timeout);
  }, [messages, status, onCompleted]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  }

  const visibleMessages = messages.filter(
    (message) => message.role !== "user" || messageText(message.parts) !== CHAT_KICKOFF_MARKER
  );

  const lastMessage = messages[messages.length - 1];
  const isWaitingForAssistant =
    (status === "submitted" || status === "streaming") &&
    (!lastMessage || lastMessage.role === "user" || messageText(lastMessage.parts) === "");

  return (
    <div className={styles.wrapper}>
      <div className={styles.messages}>
        {visibleMessages.map((message) => {
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
          disabled={status !== "ready"}
          aria-label="Сообщение"
        />
        <Button type="submit" isDisabled={status !== "ready" || !input.trim()}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
