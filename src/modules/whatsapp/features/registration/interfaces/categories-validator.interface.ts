import { NewsCategory } from "@/shared/entities/user.entity";

export interface ICategoriesValidator {
  isValid(categories: NewsCategory[]): boolean;
}

