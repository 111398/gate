import type { UIMessage } from "ai";

interface HistoryItem {
  id: string;
  sender: string;
  content: string;
}

export function toUIMessages(items: HistoryItem[]): UIMessage[] {
  return items.map((item) => ({
    id: item.id,
    role: item.sender === "user" ? "user" : "assistant",
    parts: [{ type: "text", text: item.content }],
  }));
}
