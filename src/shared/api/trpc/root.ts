import { consentsRouter } from "./routers/consents";
import { personaRouter } from "./routers/persona";
import { router } from "./trpc";

// Домены будут добавляться по мере реализации: trainingFiles, messages.
export const appRouter = router({
  consents: consentsRouter,
  persona: personaRouter,
});

export type AppRouter = typeof appRouter;
