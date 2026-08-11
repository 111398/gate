"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

export function usePersonaChat(initialMessages: UIMessage[]) {
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  return useChat({ transport, messages: initialMessages });
}
