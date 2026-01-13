import { Message } from "whatsapp-web.js";
import { NewsCategory, UserLanguage } from "@/shared/entities/user.entity";

export interface RegistrationSuccessData {
  categories: NewsCategory[];
  language: UserLanguage;
  preferredHour: number;
}

export interface IRegistrationPresenter {
  showCategoriesHelp(message: Message): Promise<void>;
  showSuccess(message: Message, data: RegistrationSuccessData): Promise<void>;
}

