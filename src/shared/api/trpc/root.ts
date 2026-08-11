import { consentsRouter } from "./routers/consents";
import { messagesRouter } from "./routers/messages";
import { personaRouter } from "./routers/persona";
import { trainingFilesRouter } from "./routers/training-files";
import { router } from "./trpc";

export const appRouter = router({
  consents: consentsRouter,
  persona: personaRouter,
  trainingFiles: trainingFilesRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
