import { defaultClasses, plugin, prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
const findorcreate = require("mongoose-findorcreate");

@plugin(findorcreate)
export class LTI13Conf extends defaultClasses.FindOrCreate implements Base {
  public _id!: Types.ObjectId;
  public id!: string;

  @prop({ required: true })
  public iss!: string;

  @prop({ required: true })
  public keyId!: string;

  @prop({ required: true })
  public mySecret!: string;

  @prop({ required: true })
  public myPublic!: string;

  @prop({ required: true })
  public status!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop()
  public jwks?: string;

  @prop()
  public otherPublic?: string;

  @prop()
  public clientId?: string;

  @prop()
  public deploymentId?: string;

  @prop({ required: true })
  public loginURL!: string;

  // ************************************************************************************************
}
