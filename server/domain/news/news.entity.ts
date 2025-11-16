import { prop, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";

export enum NewsPlatform {
  BBC = "BBC",
  G1 = "G1",
  BRAZIL_INDEED = "BRAZIL_INDEED",
}

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "news",
  },
})
export class NewsEntity {
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

  @prop({ enum: NewsPlatform })
  enterprise!: NewsPlatform;

  @prop({ type: () => [String] })
  topics!: string[];

  @prop()
  created_at!: Date;

  @prop()
  updated_at!: Date;
}

