import { Message } from "whatsapp-web.js";
import { UserEntity } from "@/shared/entities/user.entity";

export interface IRegistrationStep {
  execute(message: Message, user: UserEntity): Promise<void>;
}
