import { courseRouter } from "./api/course";
import { manageQueueRouter } from "./api/manageQueue";
import { queueRouter } from "./api/queue";
import { sessionRouter } from "./api/session";
import { settingsRouter } from "./api/settings";
import { statisticsRouter } from "./api/statistics";
import { createRouter } from "./context";

export const appRouter = createRouter()
  .merge("session.", sessionRouter)
  .merge("course.", courseRouter)
  .merge("queue.", queueRouter)
  .merge("manageQueue.", manageQueueRouter)
  .merge("settings.", settingsRouter)
  .merge("statistics.", statisticsRouter);

export type AppRouter = typeof appRouter;

