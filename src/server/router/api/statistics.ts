import { TRPCError } from "@trpc/server";
import { isDocument } from "@typegoose/typegoose";
import { startOfDay } from "date-fns";
import { z } from "zod";
import { ParticipantModel, SessionModel, UserModel } from "../../../models/modelClasses";
import { QueueService } from "../../../services/QueueService";
import { StatisticsService } from "../../../services/StatisticsService";

import { createRouter } from "../context";

type ParticipantItem = {
  name: string;
  locations: string;
  email: string;
};

export const statisticsRouter = createRouter()
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
  .query("getMostFrequentUsers", {
    async resolve({ ctx }) {
      if (!ctx.richSession.isTeacher) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const users: any = {};

      const agg = await ParticipantModel.aggregate([
        { $match: { course: ctx.course._id } },
        { $group: { _id: "$user", c: { $sum: 1 } } },
        { $sort: { c: -1 } },
      ]);

      const userList: string[] = [];

      agg.forEach((x) => {
        userList.push(x._id);
      });

      const userNames = await UserModel.find({ _id: { $in: userList } });
      userNames.forEach((x) => {
        users[x._id.toString()] = x.fullName;
      });

      const participants: any = [];
      let i = 1;
      agg.forEach((x) => {
        participants.push([i, users[x._id.toString()], x.c]);
        i += 1;
      });

      return participants;
    },
  })
  // ************************************************************************************************
  .query("getAllSessionNames", {
    async resolve({ ctx }) {
      if (!ctx.richSession.isTeacher) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const sessions = await SessionModel.find({ course: ctx.course.id }).sort({ weekday: 1, startTime: 1 });
      return sessions.map((x) => {
        return { name: x.name, id: x.id };
      });
    },
  })
  // ************************************************************************************************
  .query("getStatisticsTableDate", {
    async resolve({ ctx }) {
      const result = await StatisticsService.getStatisticsTable(ctx.course, ctx.session.role);
      if (result.availableStats.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return result;
    },
  })
  // ************************************************************************************************
  .mutation("getParticipants", {
    input: z.object({
      session: z.string(),
      date: z.number().int(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.richSession.isTeacher) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const sessionObj = await QueueService.findSessionById(ctx.course, input.session);
      if (sessionObj) {
        const users = await ParticipantModel.find({
          session: sessionObj.id,
          course: ctx.course.id,
          date: startOfDay(new Date(input.date)),
        }).populate("user");
        const participants: ParticipantItem[] = [];

        users.forEach((r) => {
          participants.push({
            name: isDocument(r.user) ? r.user.fullName : "?",
            email: isDocument(r.user) ? r.user.email : "?",
            locations: r.locations.join(", "),
          });
        });

        return participants;
      }

      throw new TRPCError({ code: "NOT_FOUND" });
    },
  });
