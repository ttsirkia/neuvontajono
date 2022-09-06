import type { Ref } from "@typegoose/typegoose";
import { defaultClasses, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
import { User } from "./User";
const findorcreate = require("mongoose-findorcreate");

// ************************************************************************************************

export type CourseDTO = {
  name: string;
  courseId: string;
  url: string;
  combined: string;
  projectorConf: string;
  defaultLanguage: string;
  statisticsLevel: number;
  statisticsQueueLevel: number;
  statisticsGraphLevel: number;
  participationPolicy: number;
  requireSignUp: boolean;
  remoteHelp: string;
};

// ************************************************************************************************

@plugin(findorcreate)
export class Course extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true, index: true })
  public courseId!: string;

  @prop()
  public url?: string;

  @prop()
  public combined?: string;

  @prop()
  public projectorConf?: string;

  @prop({ required: true, default: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE })
  public defaultLanguage!: string;

  @prop({ ref: () => User })
  public createdBy!: Ref<User>;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ required: true, default: 0, min: -1, max: 2 })
  public statisticsLevel!: number;

  @prop({ required: true, default: 2, min: 0, max: 2 })
  public statisticsQueueLevel!: number;

  @prop({ required: true, default: 2, min: 0, max: 2 })
  public statisticsGraphLevel!: number;

  @prop({ required: true, default: 1, min: 1, max: 3 })
  public participationPolicy!: number;

  @prop({ default: false })
  public requireSignUp!: boolean;

  @prop({ default: "" })
  public remoteHelp?: string;

  // ************************************************************************************************

  public convertCourseToDTO(this: Course): CourseDTO {
    return {
      name: this.name,
      courseId: this.courseId,
      url: this.url ?? "",
      combined: this.combined ?? "",
      projectorConf: this.projectorConf ?? "",
      defaultLanguage: this.defaultLanguage ?? "",
      statisticsLevel: this.statisticsLevel,
      statisticsQueueLevel: this.statisticsQueueLevel,
      statisticsGraphLevel: this.statisticsGraphLevel,
      participationPolicy: this.participationPolicy,
      requireSignUp: this.requireSignUp,
      remoteHelp: this.remoteHelp ?? "",
    };
  }
}
