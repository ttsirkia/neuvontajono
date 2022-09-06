import { defaultClasses, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
const findorcreate = require("mongoose-findorcreate");

@plugin(findorcreate)
export class LTIConf extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public version!: string;

  @prop()
  public description?: string;

  @prop({ required: true })
  public content!: string;

  // ************************************************************************************************
}
