import { INewsPlatform } from "@/types/index";
import { prop, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "news",
  },
})
export class News {
  @prop({ type: () => Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @prop({ required: true })
  title!: string;

  @prop()
  description!: string;

  @prop()
  link!: string;

  @prop()
  image!: string;

  @prop()
  news_summary?: string;

  @prop()
  date!: Date;

  @prop()
  enterprise!: INewsPlatform;

  @prop({ type: () => [String] })
  topics!: string[];

  @prop()
  created_at!: Date;

  @prop()
  updated_at!: Date;
}
