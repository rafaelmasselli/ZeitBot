import { injectable } from "tsyringe";
import { NewsCategory } from "@/shared/entities/user.entity";
import { ICategoriesValidator } from "../interfaces/categories-validator.interface";

@injectable()
export class CategoriesValidator implements ICategoriesValidator {
  isValid(categories: NewsCategory[]): boolean {
    return categories.length > 0;
  }
}

