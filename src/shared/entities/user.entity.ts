import { prop, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";

export enum UserRegistrationStep {
  NONE = "none",
  AWAITING_CATEGORIES = "awaiting_categories",
  AWAITING_PREFERENCES = "awaiting_preferences",
  COMPLETED = "completed",
}

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

export enum UserLanguage {
  PORTUGUESE = "portuguese",
  ENGLISH = "english",
  SPANISH = "spanish",
  FRENCH = "french",
  GERMAN = "german",
  ITALIAN = "italian",
  CHINESE = "chinese",
  JAPANESE = "japanese",
}

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "users",
  },
})
export class UserEntity {
  @prop({ type: () => Types.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @prop({ required: true, unique: true })
  phone_number!: string;

  @prop()
  name?: string;

  @prop({ default: UserRegistrationStep.NONE })
  registration_step!: UserRegistrationStep;

  @prop({ default: "portuguese" })
  preferred_language!: string;

  @prop({ type: () => [String], enum: NewsCategory, default: [] })
  preferred_categories!: NewsCategory[];

  @prop()
  preferences_description?: string;

  @prop({ type: () => [Number] })
  preferences_embedding?: number[];

  @prop({ default: true })
  is_active!: boolean;

  @prop({ default: 8 })
  preferred_hour!: number;

  @prop({ default: 0.6 })
  similarity_threshold!: number;

  @prop()
  last_message_sent?: Date;

  @prop()
  created_at!: Date;

  @prop()
  updated_at!: Date;
}
