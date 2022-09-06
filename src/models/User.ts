import { defaultClasses, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
const findorcreate = require("mongoose-findorcreate");

// ************************************************************************************************

export class Name {
  @prop({ required: true, default: "" })
  public first!: string;
  @prop({ required: true, default: "" })
  public last!: string;
}

// ************************************************************************************************

@plugin(findorcreate)
export class User extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ _id: false, required: true })
  public name!: Name;

  @prop({ index: true })
  public ltiId!: string;

  @prop({ required: true })
  public email!: string;

  @prop({ required: true, default: 1 })
  public previousRow!: number;

  @prop()
  public previousLocation?: string;

  @prop()
  public previousLanguage?: string;

  @prop({ default: true })
  public previousParticipationLocal?: boolean;

  @prop()
  public previousCallURL?: string;

  public get fullName() {
    return `${this.name.first} ${this.name.last}`;
  }
}
