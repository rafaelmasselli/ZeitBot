import { injectable } from "tsyringe";
import { NewsCategory, UserLanguage } from "@/shared/entities/user.entity";

@injectable()
export class TranslationService {
  private categoryTranslations: Record<string, string> = {
    technology: "Tecnologia",
    politics: "Política",
    sports: "Esportes",
    economy: "Economia",
    health: "Saúde",
    entertainment: "Entretenimento",
    world: "Internacional",
    all: "Todas",
  };

  private languageTranslations: Record<string, string> = {
    portuguese: "Português",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",
    italian: "Italiano",
    chinese: "中文",
    japanese: "日本語",
  };

  translateCategory(category: NewsCategory): string {
    return this.categoryTranslations[category] || category;
  }

  translateLanguage(language: UserLanguage): string {
    return this.languageTranslations[language] || language;
  }

  translateCategories(categories: NewsCategory[]): string {
    return categories
      .map((cat) => this.translateCategory(cat))
      .join(", ");
  }
}

