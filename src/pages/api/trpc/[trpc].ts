// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/router";
import { createContext } from "../../../server/router/context";
import { QueueService } from "../../../services/QueueService";
import { StatisticsService } from "../../../services/StatisticsService";

// This is a hack to place these task here as NextJS doesn't provide any better place
setInterval(() => {
  QueueService.cleanQueues();
}, 1000 * 60 * 5);

setInterval(() => {
  StatisticsService.saveQueueLengths();
}, 1000 * 30);

export default createNextApiHandler({
  router: appRouter,
  createContext: createContext,
});

// Avoid incorrect messages about API calls without responses because of session cookie handling
export const config = {
  api: {
    externalResolver: true,
  },
};

