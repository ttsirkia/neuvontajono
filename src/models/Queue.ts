import type { Ref } from "@typegoose/typegoose";
import { defaultClasses, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
const findorcreate = require("mongoose-findorcreate");

import { Course } from "./Course";
import { Session } from "./Session";
import { User } from "./User";

// ************************************************************************************************

export type QueueUser = {
  name: string;
  firstName: string;
  id: any;
  position: number;
  location: string;
  row: number;
  eventTime: number;
  language: string;
  callURL: string;
  email: string;
};

// ************************************************************************************************

@plugin(findorcreate)
export class Queue extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ ref: () => User })
  public user!: Ref<User>;

  @prop({ ref: () => Course, index: true })
  public course!: Ref<Course>;

  @prop({ ref: () => Session })
  public session!: Ref<Session>;

  @prop({ required: true })
  public location!: string;

  @prop({ required: true })
  public row!: number;

  @prop({ required: true, default: Date.now, index: true })
  public enteredAt!: Date;

  @prop({ index: true })
  public removedAt?: Date;

  @prop()
  public language?: string;

  @prop()
  public callURL?: string;
}
