import { UserEntity, NewsCategory, UserLanguage } from "@/shared/entities/user.entity";

export interface RegistrationData {
  categories: NewsCategory[];
  language: UserLanguage;
}

export interface IRegistrationPersister {
  saveCategories(user: UserEntity, data: RegistrationData): Promise<void>;
}

