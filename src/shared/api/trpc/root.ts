import { consentsRouter } from "./routers/consents";
import { feedbackRouter } from "./routers/feedback";
import { messagesRouter } from "./routers/messages";
import { personaRouter } from "./routers/persona";
import { trainingFilesRouter } from "./routers/training-files";
import { router } from "./trpc";

export const appRouter = router({
  consents: consentsRouter,
  persona: personaRouter,
  trainingFiles: trainingFilesRouter,
  messages: messagesRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
