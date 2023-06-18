import { getModelForClass } from "@typegoose/typegoose";
import { Course } from "./Course";
import { LTI13Conf } from "./LTI13Conf";
import { LTIConf } from "./LTIConf";
import { Participant } from "./Participant";
import { Queue } from "./Queue";
import { Session } from "./Session";
import { SessionStats } from "./SessionStats";
import { User } from "./User";

export const CourseModel = getModelForClass(Course);
export const ParticipantModel = getModelForClass(Participant);
export const QueueModel = getModelForClass(Queue);
export const SessionModel = getModelForClass(Session);
export const SessionStatsModel = getModelForClass(SessionStats);
export const UserModel = getModelForClass(User);
export const LTIConfModel = getModelForClass(LTIConf);
export const LTI13ConfModel = getModelForClass(LTI13Conf);
