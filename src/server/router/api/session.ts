import { Role } from "../../../utils/session";
import { createRouter } from "../context";

// This is for browser session, not for course session!

// ************************************************************************************************

export interface SessionInfo {
  userName?: string;
  courseName?: string;
  courseId?: string;
  language: string;
  role: Role;
  sessionId?: string;
  statisticsLevel: number;
  statisticsQueueLevel: number;
}

// ************************************************************************************************

export const sessionRouter = createRouter().query("getSessionInfo", {
  async resolve({ ctx }) {
    const response: SessionInfo = {
      userName: ctx.richSession?.user?.fullName,
      courseName: ctx.richSession?.course?.name,
      courseId: ctx.richSession?.course?.id,
      language: ctx.session?.language ?? process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "en",
      role: ctx.session?.role ?? "student",
      sessionId: ctx.session?.id ?? "",
      statisticsLevel: ctx.richSession?.course?.statisticsLevel ?? 3,
      statisticsQueueLevel: ctx.richSession?.course?.statisticsQueueLevel ?? 3,
    };

    return response;
  },
});
