export { usePersonaChat } from "./model/use-persona-chat";
export { toUIMessages } from "./model/to-ui-messages";

// buildPersonaSystemPrompt и retrieveRelevantMemories (server-only) намеренно не
// реэкспортируются здесь — этот индекс импортируют и клиентские компоненты
// (ChatWindow), а баррел, смешивающий server-only с клиентским кодом, ломает сборку.
// Импортировать их напрямую из ./model/system-prompt и ./model/retrieve-relevant-memories.
