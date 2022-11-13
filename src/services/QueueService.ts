import { isDocument } from "@typegoose/typegoose";
import { add, differenceInSeconds, format, startOfDay, startOfISOWeek } from "date-fns";
import { Course } from "../models/Course";
import { ParticipantModel, QueueModel, SessionModel, UserModel } from "../models/modelClasses";
import { QueueUser } from "../models/Queue";
import { Session, SessionDTOWithLength, SessionDTOWithLengthAndLocalRemote } from "../models/Session";
import { User } from "../models/User";
import { dbConnect } from "../utils/database";
import { getDatesBetween } from "../utils/dates";
import { StatisticsService } from "./StatisticsService";
import { UserService } from "./UserService";

export namespace QueueService {
  // ************************************************************************************************
  export const getCurrentSessions = async (course?: Course): Promise<Session[]> => {
    await dbConnect();

    const now = new Date();
    const weekday = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const today = startOfDay(now);
    const query: any = {
      weekday: weekday,
      active: true,
      queueOpenTime: { $lte: minutes },
      endTime: { $gt: minutes },
      startDate: { $lte: now },
      endDate: { $gte: today },
      excludedDates: { $nin: [format(new Date(), "yyyy-MM-dd")] },
    };

    if (course) {
      query.course = course.id;
    }

    return await SessionModel.find(query).sort({ weekday: "asc", startTime: "asc" }).populate("course");
  };

  // ************************************************************************************************
  export const getSessionsToday = async (course: Course) => {
    await dbConnect();

    const now = new Date();
    const weekday = now.getDay();
    const today = startOfDay(now);

    return await SessionModel.find({
      course: course.id,
      weekday: weekday,
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: today },
      excludedDates: { $nin: [format(new Date(), "yyyy-MM-dd")] },
    }).sort({ weekday: "asc", startTime: "asc" });
  };

  // ************************************************************************************************
  export const getSessionsThisWeek = async (course: Course) => {
    await dbConnect();

    const now = new Date();
    const today = startOfDay(now);
    const endOfWeek = add(startOfISOWeek(now), { days: 7 });

    return await SessionModel.find({
      active: true,
      course: course.id,
      startDate: { $lt: endOfWeek },
      endDate: { $gte: today },
      excludedDates: { $nin: getDatesBetween(startOfISOWeek(now), add(endOfWeek, { hours: -1 }), -1) },
    }).sort({ weekday: "asc", startTime: "asc" });
  };

  // ************************************************************************************************
  export const getAllSessions = async (course: Course) => {
    await dbConnect();
    return await SessionModel.find({ course: course.id }).sort({ weekday: "asc", startTime: "asc" });
  };

  // ************************************************************************************************

  export const findSessionById = async (course: Course, sessionId: string) => {
    await dbConnect();
    return await SessionModel.findOne({ _id: sessionId, course: course.id });
  };

  // ************************************************************************************************
  export const addUserToQueue = async (
    course: Course,
    session: Session,
    user: User,
    location: string,
    row: number,
    language: string,
    callURL: string
  ) => {
    await dbConnect();
    const newQueueItem = await QueueModel.findOrCreate(
      {
        course: course.id,
        user: user.id,
        removedAt: null,
      },
      { session: session.id, location, row, language, callURL }
    );

    if (!newQueueItem.created) {
      newQueueItem.doc.session = session;
      newQueueItem.doc.location = location;
      newQueueItem.doc.row = row;
      newQueueItem.doc.language = language;
      newQueueItem.doc.callURL = callURL;
      await newQueueItem.doc.save();
    }

    const prevValues: Partial<User> = { previousParticipationLocal: row > 0 };
    if (row > 0) {
      prevValues.previousLocation = location;
      prevValues.previousRow = row;
    }

    if (language) {
      prevValues.previousLanguage = language;
    }

    if (row < 0) {
      prevValues.previousCallURL = callURL;
    }

    await UserModel.updateOne({ _id: user.id }, { $set: prevValues });
    await StatisticsService.saveQueueLength(session, course);
    await addParticipant(course, session, user, location, false);

    updateStaffSocketData(course, session);
    updateUserSocketData(course);
    return newQueueItem.doc;
  };

  // ************************************************************************************************

  export const getUserPositionInQueue = async (course: Course, user: User) => {
    await dbConnect();
    const queueItem = await QueueModel.findOne({ course: course.id, user: user.id, removedAt: null });
    if (!queueItem) {
      return 0;
    } else {
      const query = {
        course: course.id,
        $or: [{ session: queueItem.session }, { location: queueItem.location }],
        enteredAt: { $lte: queueItem.enteredAt },
        removedAt: null,
      };
      const count = await QueueModel.find(query).count();
      return count;
    }
  };

  // ************************************************************************************************

  export const removeUserFromQueue = async (course: Course, user: User) => {
    await dbConnect();
    const queueItem = await QueueModel.findOneAndUpdate(
      { course: course.id, user: user.id, removedAt: null },
      { removedAt: new Date() }
    ).populate("session");
    if (queueItem && isDocument(queueItem.session)) {
      updateStaffSocketData(course, queueItem.session);
      updateUserSocketData(course);
    }
    return queueItem;
  };

  // ************************************************************************************************

  export const removeFromQueueById = async (course: Course, id: string) => {
    await dbConnect();
    const queueItem = await QueueModel.findOneAndUpdate({ course: course.id, _id: id }, { removedAt: new Date() })
      .populate("session")
      .populate("user");
    if (queueItem && isDocument(queueItem.session)) {
      const duration = differenceInSeconds(new Date(), queueItem.enteredAt);
      StatisticsService.addQueueDuration(queueItem.session, course, duration);

      const curSessions = await getCurrentSessions(course);
      let selected: Session | null = null;
      curSessions.forEach((x, i) => {
        const foundCorrect = x.id === queueItem.session?.id;
        const foundInSameLocation =
          selected === null && x.getAllVisibleLocations(course).indexOf(queueItem.location) >= 0;
        if (foundCorrect || foundInSameLocation) {
          selected = x;
        }

        // User did not get assistance in the session in which originally
        // entered => participant in two sessions
        if (
          i === curSessions.length - 1 &&
          selected &&
          selected.id !== queueItem.session?.id &&
          isDocument(queueItem.user)
        ) {
          addParticipant(course, selected, queueItem.user, queueItem.location, true);
        }
      });

      updateStaffSocketData(course, queueItem.session);
      updateUserSocketData(course);
    }
    return queueItem;
  };

  // ************************************************************************************************

  export const getUsersInQueue = async (course: Course, session: Session) => {
    await dbConnect();
    const query = {
      course: course.id,
      removedAt: null,
      $or: [{ session: session._id }, { location: { $in: session.getAllLocations(course) } }],
    };
    return await QueueModel.find(query).sort("enteredAt").populate("user");
  };

  // ************************************************************************************************

  export const getRecentlyRemovedUsers = async (course: Course, session: Session) => {
    await dbConnect();
    const query = {
      course: course.id,
      removedAt: { $gte: add(new Date(), { minutes: -5 }) },
      $or: [{ session: session._id }, { location: { $in: session.getAllLocations(course) } }],
    };
    return await QueueModel.find(query).sort("-removedAt").populate("user").limit(5);
  };

  // ************************************************************************************************

  export const getQueueLength = async (course: Course, session: Session) => {
    await dbConnect();
    const query = {
      course: course.id,
      removedAt: null,
      $or: [{ session: session._id }, { location: { $in: session.getAllLocations(course) } }],
    };
    return await QueueModel.find(query).count();
  };

  // ************************************************************************************************

  export const hasSignedUpById = async (course: Course, sessionId: any, location: string, user: User) => {
    if (course.statisticsLevel < 0 || !course.requireSignUp) {
      return true;
    }

    const today = startOfDay(new Date());
    const result = await ParticipantModel.findOne({
      user: user.id,
      session: sessionId,
      course: course.id,
      date: today,
      locations: { $in: [location] },
    });
    return result !== null;
  };

  // ************************************************************************************************

  export const addParticipant = async (
    course: Course,
    session: Session,
    user: User,
    location: string,
    signUp: boolean
  ) => {
    const minutes = new Date().getHours() * 60 + new Date().getMinutes();
    const today = startOfDay(new Date());

    // Saving personal data is disabled
    if (course.statisticsLevel < 0) {
      return;
    }

    const result = await ParticipantModel.findOrCreate({
      user: user.id,
      session: session.id,
      course: course.id,
      date: today,
    });

    if (result.doc) {
      if (!signUp) {
        const newEnteredAt = result.doc.enteredAt.slice(0);
        newEnteredAt.push(minutes);
        result.doc.enteredAt = newEnteredAt;
      }

      const newLocations = result.doc.locations.slice(0);
      if (newLocations.indexOf(location) < 0) {
        newLocations.push(location);
      }
      result.doc.locations = newLocations;
      await result.doc.save();
    }
  };

  // ************************************************************************************************

  export const getSessionData = async (course: Course, session: Session) => {
    await dbConnect();
    const inQueue = await getUsersInQueue(course, session);
    const recentlyRemoved = await getRecentlyRemovedUsers(course, session);
    const allSessions = await getCurrentSessions(course);
    let queueOpenInLocation = false;

    let allOpenLocations: string[] = [];
    allSessions.forEach((x) => {
      allOpenLocations = x.getAllVisibleLocations(course).concat(allOpenLocations);
    });
    session
      .getAllVisibleLocations(course)
      .forEach((x) => (queueOpenInLocation = queueOpenInLocation || allOpenLocations.indexOf(x) >= 0));

    // This will be used in projector mode to show the correct session-specific image
    // regardless of which session was originally opened if the following sessions
    // are in the same location
    let openQueueName = "";
    if (session.isOpen) {
      openQueueName = session.name;
    } else {
      allSessions.forEach((x) => {
        session.getAllLocations(course).forEach((y) => {
          if (x.getAllVisibleLocations(course).indexOf(y) >= 0) {
            openQueueName = x.name;
          }
        });
      });
    }

    return {
      name: session.name,
      id: session.id,
      locations: session.getAllVisibleLocations(course),
      projectorConf: course.projectorConf ?? "",
      queueOpen: queueOpenInLocation,
      openQueueName,
      inQueue: inQueue.map((x, i) => {
        const queueUser: QueueUser = {
          name: isDocument(x.user) ? x.user.fullName : "?",
          firstName: isDocument(x.user) ? x.user.name.first : "?",
          id: x.id,
          position: i + 1,
          location: x.location,
          row: x.row,
          eventTime: x.enteredAt.getTime(),
          language: x.language ?? "",
          callURL: x.callURL ?? "",
          email: isDocument(x.user) ? x.user.email : "",
        };
        return queueUser;
      }),
      recentlyRemoved: recentlyRemoved.map((x, i) => {
        const queueUser: QueueUser = {
          name: isDocument(x.user) ? x.user.fullName : "?",
          firstName: isDocument(x.user) ? x.user.name.first : "?",
          id: x.id,
          position: i + 1,
          location: x.location,
          row: x.row,
          eventTime: x.removedAt?.getTime() || x.enteredAt.getTime(),
          language: x.language ?? "",
          callURL: x.callURL ?? "",
          email: isDocument(x.user) ? x.user.email : "",
        };
        return queueUser;
      }),
    };
  };

  // ************************************************************************************************

  export const getUserAndSessionData = async (course: Course, user: User) => {
    const sessions = await getCurrentSessions(course);
    return {
      userPosition: await getUserPositionInQueue(course, user),
      previousRow: user.previousRow,
      previousLanguage: user.previousLanguage ?? "",
      previousParticipationLocal: user.previousParticipationLocal === true,
      previousLocation: user.previousLocation ?? "",
      previousCallURL: user.previousCallURL ?? "",
      remoteHelp: course.remoteHelp,
      sessions: await Promise.all(
        splitSessions(
          await Promise.all(
            sessions.map(async (s) => {
              return {
                queueLength: await getQueueLength(course, s),
                ...s.convertSessionToDTO(course, "remote-pseudoname"),
              };
            })
          ),
          course
        ).map(async (x) => {
          return {
            ...x,
            hasSignedUp: x.remote || !course.requireSignUp || (await hasSignedUpById(course, x.id, x.location, user)),
          };
        })
      ),
    };
  };

  // ************************************************************************************************

  export const clearQueue = async (course: Course, session: Session) => {
    await dbConnect();
    const locs = session.getAllLocations(course);
    await QueueModel.deleteMany({
      course: course.id,
      $or: [{ session: session.id }, { location: { $in: locs } }],
    });
    updateStaffSocketData(course, session);
    updateUserSocketData(course);
  };

  // ************************************************************************************************

  export const enableAllSessions = async (course: Course) => {
    await dbConnect();
    await SessionModel.updateMany(
      {
        course: course.id,
      },
      { $set: { active: true } }
    );
    updateUserSocketData(course);
  };

  // ************************************************************************************************

  export const disableAllSessions = async (course: Course) => {
    await dbConnect();
    await SessionModel.updateMany(
      {
        course: course.id,
      },
      { $set: { active: false } }
    );
    updateUserSocketData(course);
  };

  // ************************************************************************************************

  export const deleteSession = async (course: Course, session: Session) => {
    await dbConnect();
    const deleted = await SessionModel.findOneAndDelete({ course: course.id, _id: session.id });
    updateUserSocketData(course);
    return deleted;
  };

  // ************************************************************************************************
  export const updateSession = async (course: Course, session: Session, newData: Partial<Session>) => {
    await dbConnect();
    const sessionObj = await SessionModel.findOne({ _id: session.id, course: course.id });
    if (!sessionObj) {
      throw new Error("Not found!");
    }

    Object.assign(sessionObj, newData);
    await sessionObj.save();
    updateUserSocketData(course);
    return sessionObj;
  };

  // ************************************************************************************************
  export const createSession = async (course: Course, newSession: Partial<Session>) => {
    await dbConnect();
    const newSessionObj = await SessionModel.create({ ...newSession, course: course.id });
    updateUserSocketData(course);
    return newSessionObj;
  };

  // ************************************************************************************************

  export const cleanQueues = async () => {
    await dbConnect();
    const prev12h = add(new Date(), { hours: -12 });
    const prev5min = add(new Date(), { minutes: -5 });

    await QueueModel.deleteMany({ enteredAt: { $lte: prev12h } });
    await QueueModel.deleteMany({ removedAt: { $lte: prev5min } });
  };

  // ************************************************************************************************

  export const updateStaffSocketData = async (course: Course, session: Session) => {
    if (global.socketIOInstance) {
      const sessionData = await getSessionData(course, session);
      sessionData.locations.forEach((x) => {
        global.socketIOInstance.to("Staff|" + x.trim() + "|" + course.id).emit("staffQueueResponse", sessionData);
      });
    }
  };

  // ************************************************************************************************

  export const updateUserSocketData = async (course: Course) => {
    if (global.socketIOInstance) {
      const sockets = await global.socketIOInstance.in("User|" + course.id).fetchSockets();

      const sessions = await getCurrentSessions(course);
      const sessionData = {
        userPosition: 0,
        sessions: splitSessions(
          await Promise.all(
            sessions.map(async (s) => {
              return {
                queueLength: await getQueueLength(course, s),
                ...s.convertSessionToDTO(course, "remote-pseudoname"),
              };
            })
          ),
          course
        ),
      };

      sockets.forEach(async (s) => {
        const userId: string = s.data.session.userId;
        const user = await UserService.find(userId);
        if (user) {
          s.emit("userQueueResponse", {
            sessions: await Promise.all(
              sessionData.sessions.map(async (x) => {
                return {
                  ...x,
                  hasSignedUp:
                    x.remote || !course.requireSignUp || (await hasSignedUpById(course, x.id, x.location, user)),
                };
              })
            ),
            userPosition: await getUserPositionInQueue(course, user),
            previousRow: user.previousRow,
            previousLanguage: user.previousLanguage ?? "",
            previousParticipationLocal: user.previousParticipationLocal === true,
            previousLocation: user.previousLocation ?? "",
            previousCallURL: user.previousCallURL ?? "",
            remoteHelp: course.remoteHelp ?? "",
          });
        }
      });
    }
  };

  // ************************************************************************************************

  const splitSessions = (sessions: SessionDTOWithLength[], course: Course): SessionDTOWithLengthAndLocalRemote[] => {
    const splittedSessions: SessionDTOWithLengthAndLocalRemote[] = [];
    sessions.forEach((s) => {
      s.locations.forEach((l) => {
        let local = false;
        let remote = false;

        if (s.participationPolicy === 1 || (s.participationPolicy === 0 && course.participationPolicy === 1)) {
          local = true;
        }

        if (s.participationPolicy === 2 || (s.participationPolicy === 0 && course.participationPolicy === 2)) {
          remote = true;
          l = s.remoteMethod || s.locations.join(", ");
        }

        if (s.participationPolicy === 3 || (s.participationPolicy === 0 && course.participationPolicy === 3)) {
          if (l === "REMOTELOCATION") {
            remote = true;
            l = s.remoteMethod || s.locations.join(", ");
          } else {
            local = true;
          }
        }

        splittedSessions.push({
          ...s,
          local,
          remote,
          location: l,
          hasSignedUp: false,
        });
      });
    });

    return splittedSessions;
  };
}
