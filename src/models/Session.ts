import type { Ref } from "@typegoose/typegoose";
import { defaultClasses, plugin, pre, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { add, format, isAfter, isBefore, startOfDay } from "date-fns";
import { Types } from "mongoose";

import { prettyStringList, stringAsList } from "../utils/strings";
import { Course } from "./Course";
const findorcreate = require("mongoose-findorcreate");

// ************************************************************************************************

export type SessionDTO = {
  id: any;
  name: string;
  locations: string[];
  languages: string[];
  assistants: string[];
  weekday: number;
  isToday: boolean;
  isOpen: boolean;
  isOpening: boolean;
  startTime: number;
  endTime: number;
  queueOpenTime: number;
  remoteMethod: string;
  participationPolicy: number;
  startDate: string;
  endDate: string;
  active: boolean;
  excludedDates: string[];
  remoteHelp: string;
};

export type SessionDTOWithLength = SessionDTO & { queueLength: number };
export type SessionDTOWithLengthAndLocalRemote = Omit<SessionDTO, "locations"> & {
  location: string;
  queueLength: number;
  local: boolean;
  remote: boolean;
  hasSignedUp: boolean;
};

type LocationVisibility = "no-remote" | "remote-realname" | "remote-pseudoname";

// ************************************************************************************************

@plugin(findorcreate)
@pre<Session>("save", function () {
  this.assistants = prettyStringList(this.assistants ?? "");
  this.location = prettyStringList(this.location);
  this.language = prettyStringList(this.language ?? "");
})
@pre<Session>("validate", function () {
  const validationFailed =
    !this.location ||
    this.endDate < this.startDate ||
    this.endTime <= this.startTime ||
    this.startTime < this.queueOpenTime;

  if (validationFailed) {
    throw new Error("Validation failed");
  }
})
export class Session extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ ref: () => Course, index: true, required: true })
  public course!: Ref<Course>;

  @prop({ required: true })
  public startDate!: Date;

  @prop({ required: true })
  public endDate!: Date;

  @prop({ required: true, min: 0, max: 60 * 24 - 1 })
  public startTime!: number;

  @prop({ required: true, min: 0, max: 60 * 24 - 1 })
  public endTime!: number;

  @prop({ required: true, min: 0, max: 60 * 24 - 1 })
  public queueOpenTime!: number;

  @prop({ required: true, min: 0, max: 6 })
  public weekday!: number;

  @prop({ required: true })
  public location!: string;

  @prop({ required: true, default: true })
  public active!: boolean;

  @prop({ default: "" })
  public assistants?: string;

  @prop({ default: "" })
  public language?: string;

  @prop({ default: "" })
  public remoteMethod?: string;

  @prop({ required: true, default: 0, min: 0, max: 3 })
  public participationPolicy!: number;

  @prop({ required: true, default: [], type: () => [String] })
  public excludedDates!: string[];

  @prop({ default: "" })
  public remoteHelp?: string;

  // ************************************************************************************************

  public get isOpen() {
    const now = new Date();
    return (
      new Date().getDay() === this.weekday &&
      this.active &&
      isAfter(now, startOfDay(this.startDate)) &&
      isBefore(now, startOfDay(add(this.endDate, { days: 1 }))) &&
      isAfter(now, add(startOfDay(now), { minutes: this.queueOpenTime })) &&
      isBefore(now, add(startOfDay(now), { minutes: this.endTime }))
    );
  }

  public get isOpening() {
    const now = new Date();
    return (
      new Date().getDay() === this.weekday &&
      this.active &&
      isAfter(now, startOfDay(this.startDate)) &&
      isBefore(now, startOfDay(add(this.endDate, { days: 1 }))) &&
      isAfter(now, add(startOfDay(now), { minutes: this.queueOpenTime - 15 })) &&
      isBefore(now, add(startOfDay(now), { minutes: this.endTime }))
    );
  }

  public get isToday() {
    const now = new Date();
    const weekday = now.getDay();
    return this.weekday === weekday;
  }

  // ************************************************************************************************

  public getAllLocations(this: Session, course: Course) {
    if (this.participationPolicy === 2 || (this.participationPolicy === 0 && course.participationPolicy === 2)) {
      return ["REMOTELOCATION"];
    }

    let items = stringAsList(this.location);

    if (this.participationPolicy === 3 || (this.participationPolicy === 0 && course.participationPolicy === 3)) {
      items.push("REMOTELOCATION");
    }

    return items;
  }

  public getAllVisibleLocations(this: Session, course: Course) {
    let items = stringAsList(this.location);

    if (this.participationPolicy === 3 || (this.participationPolicy === 0 && course.participationPolicy === 3)) {
      if (this.remoteMethod) {
        items.push(this.remoteMethod);
      }
    }

    return items;
  }

  public convertSessionToDTO(
    this: Session,
    course: Course,
    locationVisibility: LocationVisibility = "remote-realname"
  ): SessionDTO {
    return {
      id: this.id,
      name: this.name,
      locations:
        locationVisibility !== "no-remote"
          ? locationVisibility === "remote-realname"
            ? this.getAllVisibleLocations(course)
            : this.getAllLocations(course)
          : stringAsList(this.location),
      languages: stringAsList(this.language ?? ""),
      assistants: stringAsList(this.assistants ?? ""),
      weekday: this.weekday,
      isToday: this.isToday,
      isOpen: this.isOpen,
      isOpening: this.isOpening,
      startTime: this.startTime,
      endTime: this.endTime,
      queueOpenTime: this.queueOpenTime,
      remoteMethod: this.remoteMethod ?? "",
      participationPolicy: this.participationPolicy,
      startDate: format(this.startDate, "yyyy-MM-dd"),
      endDate: format(this.endDate, "yyyy-MM-dd"),
      active: this.active,
      excludedDates: this.excludedDates,
      remoteHelp: this.remoteHelp ?? "",
    };
  }
}
