import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { QueueUser } from "../../models/Queue";
import { SessionDTOWithLengthAndLocalRemote } from "../../models/Session";
import { CourseService } from "../../services/CourseService";
import { QueueService } from "../../services/QueueService";
import { getSession, SessionData } from "../../utils/session";

declare global {
  var socketIOInstance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}

// ************************************************************************************************

export type StaffQueueData = {
  name: string;
  id: string;
  locations: string[];
  projectorConf: string;
  queueOpen: boolean;
  inQueue: QueueUser[];
  recentlyRemoved: QueueUser[];
};

export type UserAndSessionsData = {
  userPosition: number;
  previousRow: number;
  previousLanguage: string;
  previousParticipationLocal: boolean;
  previousLocation: string;
  previousCallURL: string;
  sessions: SessionDTOWithLengthAndLocalRemote[];
  remoteHelp: string;
};

export interface ServerToClientEvents {
  staffQueueResponse: (data: StaffQueueData) => void;
  userQueueResponse: (data: UserAndSessionsData) => void;
}

export interface ClientToServerEvents {
  staffQueueRequest: (sessionId: string) => void;
  staffQueueLeaveRequest: (sessionId: string) => void;
  userQueueRequest: (courseId: string) => void;
  userQueueLeaveRequest: (courseId: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  session: SessionData;
}

// ************************************************************************************************

const SocketHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const socket = res.socket as any;

  if (socket.server.io) {
    res.end();
    return;
  } else {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(socket.server, {
      path: "/neuvontajono/socket.io/",
    });
    socket.server.io = io;
    global.socketIOInstance = io;

    io.on("connection", async (socket) => {
      const [session, richSession] = await getSession(socket.request, res);
      if (richSession.course && richSession.user) {
        socket.data.session = session;
        const course = richSession.course;
        socket.on("staffQueueRequest", async (sessionId) => {
          const courseSession = await QueueService.findSessionById(course, sessionId);
          if (courseSession && richSession.isStaff) {
            courseSession.getAllVisibleLocations(course).forEach((x) => {
              socket.join("Staff|" + x.trim() + "|" + course.id);
            });
          }
        });
        socket.on("staffQueueLeaveRequest", async (sessionId) => {
          const courseSession = await QueueService.findSessionById(course, sessionId);
          if (courseSession && richSession.isStaff) {
            courseSession.getAllVisibleLocations(course).forEach((x) => {
              socket.leave("Staff|" + x.trim() + "|" + course.id);
            });
          }
        });
        socket.on("userQueueRequest", async (courseId) => {
          const course = await CourseService.findById(courseId);
          if (course) {
            socket.join("User|" + course.id);
          }
        });
        socket.on("userQueueLeaveRequest", async (courseId) => {
          const course = await CourseService.findById(courseId);
          if (course) {
            socket.leave("User|" + course.id);
          }
        });
      }
    });
  }
  res.end();
};

export default SocketHandler;
