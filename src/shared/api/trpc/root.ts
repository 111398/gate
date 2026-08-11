import { consentsRouter } from "./routers/consents";
import { personaRouter } from "./routers/persona";
import { trainingFilesRouter } from "./routers/training-files";
import { router } from "./trpc";

// Домены будут добавляться по мере реализации: messages.
export const appRouter = router({
  consents: consentsRouter,
  persona: personaRouter,
  trainingFiles: trainingFilesRouter,
});

export type AppRouter = typeof appRouter;
