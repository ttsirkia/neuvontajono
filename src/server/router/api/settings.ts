import { TRPCError } from "@trpc/server";
import { parse } from "date-fns";
import { z } from "zod";
import { ParticipantModel } from "../../../models/modelClasses";
import { Session } from "../../../models/Session";
import { CourseService } from "../../../services/CourseService";
import { QueueService } from "../../../services/QueueService";
import { getDatesBetween } from "../../../utils/dates";
import { createRouter } from "../context";

export const settingsRouter = createRouter()
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

    // Teacher role is required for all actions in this API
    if (!ctx.richSession.isTeacher) {
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
  .query("getCourseSettings", {
    async resolve({ ctx }) {
      return ctx.course.convertCourseToDTO();
    },
  })
  // ************************************************************************************************
  .mutation("saveSettings", {
    input: z.object({
      name: z.string(),
      url: z.string(),
      combined: z.string(),
      projectorConf: z.string(),
      defaultLanguage: z.string(),
      statisticsLevel: z.number().min(-1).max(2).int(),
      statisticsQueueLevel: z.number().min(0).max(2).int(),
      statisticsGraphLevel: z.number().min(0).max(2).int(),
      participationPolicy: z.number().min(1).max(3).int(),
      requireSignUp: z.boolean(),
      remoteHelp: z.string(),
    }),
    async resolve({ input, ctx }) {
      await CourseService.update(ctx.course, {
        name: input.name,
        url: input.url,
        combined: input.combined,
        projectorConf: input.projectorConf,
        defaultLanguage: input.defaultLanguage,
        statisticsLevel: input.statisticsLevel,
        statisticsQueueLevel: input.statisticsQueueLevel,
        statisticsGraphLevel: input.statisticsGraphLevel,
        participationPolicy: input.participationPolicy,
        requireSignUp: input.requireSignUp,
        courseId: ctx.course.courseId,
        remoteHelp: input.remoteHelp,
      });

      // Remove participant info if statistics disabled
      if (input.statisticsLevel === -1) {
        await ParticipantModel.deleteMany({ course: ctx.course.id });
      }

      return true;
    },
  })
  // ************************************************************************************************
  .mutation("createOrUpdateSession", {
    input: z.object({
      sessionId: z.string().optional(),
      name: z.string().min(1),
      locations: z.string(),
      languages: z.string(),
      assistants: z.string(),
      weekday: z.number().int().min(0).max(6),
      startTime: z.number().int().min(0).max(1439),
      endTime: z.number().int().min(0).max(1439),
      queueOpenTime: z.number().int().min(0).max(1439),
      remoteMethod: z.string(),
      participationPolicy: z.number().min(0).max(3),
      startDate: z.string(),
      endDate: z.string(),
      active: z.boolean(),
      excludedDates: z.string().array(),
      remoteHelp: z.string(),
    }),
    async resolve({ input, ctx }) {
      const newData: Partial<Session> = {
        name: input.name,
        location: input.locations || input.remoteMethod,
        language: input.languages,
        assistants: input.assistants,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        queueOpenTime: input.queueOpenTime,
        remoteMethod: input.remoteMethod,
        participationPolicy: input.participationPolicy,
        startDate: parse(input.startDate, "yyyy-MM-dd", new Date()),
        endDate: parse(input.endDate, "yyyy-MM-dd", new Date()),
        active: input.active,
        excludedDates: input.excludedDates,
        remoteHelp: input.remoteHelp,
      };

      if (
        (input.participationPolicy === 3 ||
          (input.participationPolicy === 0 && ctx.course.participationPolicy === 3)) &&
        !input.remoteMethod
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (
        isNaN(newData.startDate!.valueOf()) ||
        isNaN(newData.endDate!.valueOf()) ||
        newData.startTime! < newData.queueOpenTime! ||
        newData.startTime! >= newData.endTime!
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const validDates = getDatesBetween(newData.startDate!, newData.endDate!, newData.weekday!);
      newData.excludedDates = newData.excludedDates!.filter((x) => validDates.indexOf(x) >= 0);

      if (input.sessionId) {
        // update
        const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
        if (courseSession) {
          await QueueService.updateSession(ctx.course, courseSession, newData);
          return true;
        } else {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      } else {
        // create
        await QueueService.createSession(ctx.course, newData);
        return true;
      }
    },
  })
  // ************************************************************************************************
  .mutation("enableAllSessions", {
    async resolve({ input, ctx }) {
      return await QueueService.enableAllSessions(ctx.course);
    },
  })
  // ************************************************************************************************
  .mutation("disableAllSessions", {
    async resolve({ input, ctx }) {
      return await QueueService.disableAllSessions(ctx.course);
    },
  })
  // ************************************************************************************************
  .mutation("deleteSession", {
    input: z.object({ sessionId: z.string() }),
    async resolve({ input, ctx }) {
      const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (courseSession) {
        const deleted = await QueueService.deleteSession(ctx.course, courseSession);
        return deleted !== null;
      }
    },
  })
  // ************************************************************************************************
  .query("getSingleSession", {
    input: z.object({ sessionId: z.string() }),
    async resolve({ input, ctx }) {
      const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (courseSession) {
        return {
          ...courseSession.convertSessionToDTO(ctx.course, "no-remote"),
          courseParticipationPolicy: ctx.course.participationPolicy,
        };
      }
    },
  });
