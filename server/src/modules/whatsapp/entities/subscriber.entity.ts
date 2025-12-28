import { prop, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";

export enum NewsCategory {
  TECHNOLOGY = "technology",
  POLITICS = "politics",
  SPORTS = "sports",
  ECONOMY = "economy",
  HEALTH = "health",
  ENTERTAINMENT = "entertainment",
  WORLD = "world",
  ALL = "all",
}

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "subscribers",
  },
})
export class SubscriberEntity {
  @prop({ type: () => Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @prop({ required: true, unique: true })
  phone_number!: string;

  @prop()
  name?: string;

  @prop({ type: () => [String], enum: NewsCategory, default: [NewsCategory.ALL] })
  preferred_categories!: NewsCategory[];

  @prop({ default: true })
  is_active!: boolean;

  @prop({ default: 8 })
  preferred_hour!: number;

  @prop()
  last_message_sent?: Date;

  @prop()
  created_at!: Date;

  @prop()
  updated_at!: Date;
}

