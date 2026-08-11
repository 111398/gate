import { consentsRouter } from "./routers/consents";
import { router } from "./trpc";

// Домены будут добавляться по мере реализации: persona, trainingFiles, messages.
export const appRouter = router({
  consents: consentsRouter,
});

export type AppRouter = typeof appRouter;
