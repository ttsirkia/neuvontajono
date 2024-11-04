import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { QueueService } from "../../../services/QueueService";
import { stringAsList } from "../../../utils/strings";
import { createRouter } from "../context";

const punycodeUrl = require("punycode-url");

export const queueRouter = createRouter()
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
  .mutation("addMeToQueue", {
    input: z.object({
      sessionId: z.string().regex(/^[a-fA-F0-9]{24}$/),
      row: z.number().min(-1).max(25).int(),
      location: z.string(),
      language: z.string(),
      callURL: z.string(),
    }),
    async resolve({ input, ctx }) {
      const courseSession = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (courseSession && courseSession.isOpen) {
        const cleanedLanguage = stringAsList(courseSession.language).indexOf(input.language) >= 0 ? input.language : "";
        let callURL = input.callURL;

        if (callURL !== "" && callURL.indexOf("http://") !== 0 && callURL.indexOf("https://") !== 0) {
          callURL = "";
        }

        callURL = punycodeUrl.toASCII(callURL.trim());

        QueueService.addUserToQueue(
          ctx.course,
          courseSession,
          ctx.user,
          input.location,
          input.row,
          cleanedLanguage,
          callURL
        );
        return true;
      }
      throw new TRPCError({ code: "BAD_REQUEST" });
    },
  })
  // ************************************************************************************************
  .mutation("signUp", {
    input: z.object({
      sessionId: z.string().regex(/^[a-fA-F0-9]{24}$/),
      location: z.string(),
    }),
    async resolve({ input, ctx }) {
      const sessionObj = await QueueService.findSessionById(ctx.course, input.sessionId);
      if (sessionObj) {
        await QueueService.addParticipant(ctx.course, sessionObj, ctx.user, input.location, true);
        return true;
      }
      throw new TRPCError({ code: "BAD_REQUEST" });
    },
  })
  // ************************************************************************************************
  .mutation("removeMeFromQueue", {
    async resolve({ input, ctx }) {
      await QueueService.removeUserFromQueue(ctx.course, ctx.user);
      return true;
    },
  });
