import { TRPCError } from "@trpc/server";

import { QueueService } from "../../../services/QueueService";
import { createRouter } from "../context";

export const courseRouter = createRouter()
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
  .query("getCurrentSessionsAndUserStatus", {
    async resolve({ ctx }) {
      return QueueService.getUserAndSessionData(ctx.course, ctx.user);
    },
  })
  // ************************************************************************************************
  .query("getSessionsToday", {
    async resolve({ ctx }) {
      const sessions = await QueueService.getSessionsToday(ctx.course);
      return sessions.map((s) => s.convertSessionToDTO(ctx.course));
    },
  })
  // ************************************************************************************************
  .query("getSessionsThisWeek", {
    async resolve({ ctx }) {
      const sessions = await QueueService.getSessionsThisWeek(ctx.course);
      return { sessions: sessions.map((s) => s.convertSessionToDTO(ctx.course)), url: ctx.course.url };
    },
  })
  // ************************************************************************************************
  .query("getAllSessions", {
    async resolve({ ctx }) {
      const sessions = await QueueService.getAllSessions(ctx.course);
      return sessions.map((s) => s.convertSessionToDTO(ctx.course));
    },
  });
