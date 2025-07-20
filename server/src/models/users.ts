import { prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "users",
  },
})
export class User {
  @prop()
  name!: string;

  @prop()
  number!: number;

  @prop()
  time_to_send_the_message!: Date;

  @prop()
  push_message!: boolean;

  @prop()
  interests!: string[];

  @prop()
  created_at!: Date;
}
