import { NextApiRequest } from "next";
import nextSession from "next-session";
import { promisifyStore } from "next-session/lib/compat";

import MongoStore from "connect-mongo";
import { IncomingMessage, ServerResponse } from "http";
import { Session } from "next-session/lib/types";
import { Course } from "../models/Course";
import { User } from "../models/User";
import { CourseService } from "../services/CourseService";
import { UserService } from "../services/UserService";
import { dbConnect, getMongoClientPromise } from "../utils/database";

export type Role = "student" | "staff" | "teacher";

export type SessionData = {
  courseId?: string;
  userId?: string;
  language: string;
  role: Role;
  ltiKeyId?: string;
  ltiNonce?: string;
};

export type RichSessionData = {
  course?: Course | null;
  user?: User | null;
  isTeacher: boolean;
  isStaff: boolean;
};

// ************************************************************************************************
// For back-end

const mongoStore = MongoStore.create({ clientPromise: getMongoClientPromise(), collectionName: "app_sessions" });
const session = nextSession<SessionData>({
  store: promisifyStore(mongoStore),
  name: "neuvontajono_sid",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});

export const getSession = async function (req: NextApiRequest | IncomingMessage, res: ServerResponse) {
  await dbConnect();
  const curSession = await session(req, res);

  const richSession: RichSessionData = {
    isTeacher: curSession.role === "teacher",
    isStaff: curSession.role === "staff" || curSession.role === "teacher",
  };

  if (curSession.courseId) {
    richSession.course = await CourseService.findById(curSession.courseId);
  }

  if (curSession.userId) {
    richSession.user = await UserService.find(curSession.userId);
  }

  // Session is the persisted session object, RichSessionData contains
  // populated data from database such as the course and used objects
  return [curSession, richSession] as [Session<SessionData>, RichSessionData];
};
