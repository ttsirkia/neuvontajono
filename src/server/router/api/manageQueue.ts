import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { QueueService } from "../../../services/QueueService";
import { createRouter } from "../context";

export const manageQueueRouter = createRouter()
  // ************************************************************************************************
  .middleware(async ({ ctx, next }) => {
    if (
      !ctx.richSession?.user ||
      !ctx.richSession?.course ||
      !ctx.session ||
      ctx.req?.headers["authorization"] !== ctx.session.id
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Staff role is required for all actions in this API
    if (!ctx.richSession.isStaff) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({
      ctx: {
        ...ctx,
        richSession: ctx.richSession,
        session: ctx.session,
        user: ctx.richSession.user,
        course: ctx.richSession.course,
      },
    });
  })
  // ************************************************************************************************
  .query("getSessionData", {
    input: z.object({ sessionId: z.string() }),
    async resolve({ ctx, input }) {
      const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (courseSession) {
        return QueueService.getSessionData(ctx.course, courseSession);
      }
      throw new TRPCError({ code: "NOT_FOUND" });
    },
  })
  // ************************************************************************************************
  .mutation("removeFromQueueById", {
    input: z.object({ queueId: z.string() }),
    async resolve({ input, ctx }) {
      await QueueService.removeFromQueueById(ctx.course, input.queueId);
      return true;
    },
  })
  // ************************************************************************************************
  .mutation("clearQueue", {
    input: z.object({ sessionId: z.string() }),
    async resolve({ input, ctx }) {
      const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (courseSession) {
        await QueueService.clearQueue(ctx.course, courseSession);
        return true;
      }
      throw new TRPCError({ code: "NOT_FOUND" });
    },
  });
