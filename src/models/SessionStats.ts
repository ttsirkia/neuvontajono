import type { Ref } from "@typegoose/typegoose";
import { defaultClasses, index, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
const findorcreate = require("mongoose-findorcreate");

import { Course } from "./Course";
import { Session } from "./Session";

@index({ session: 1, date: 1 })
@plugin(findorcreate)
export class SessionStats extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ ref: () => Course })
  public course!: Ref<Course>;

  @prop({ ref: () => Session })
  public session!: Ref<Session>;

  @prop({ required: true, default: Date.now })
  public date!: Date;

  @prop({ type: () => [String] })
  public queueLength!: string[];

  @prop({ type: () => [Number] })
  public queueDuration!: number[];
}
