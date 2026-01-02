import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { NewsCategory, UserLanguage } from "@/shared/entities/user.entity";
import { PromptTemplateService } from "@/shared/services/prompt-template.service";
import { CategoriesVectorService } from "./categories-vector.service";
import axios from "axios";

interface ExtractionResult {
  categories: NewsCategory[];
  language: UserLanguage;
}

@injectable()
export class CategoriesAIService {
  private readonly ollamaUrl: string;
  private readonly ollamaModel: string;
  private readonly promptName = "categories-extraction";
  private readonly useVectorMatching: boolean;

  constructor(
    @inject("ILogger") private logger: ILogger,
    @inject(PromptTemplateService) private promptService: PromptTemplateService,
    @inject(CategoriesVectorService) private vectorService: CategoriesVectorService
  ) {
    this.ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.ollamaModel = process.env.OLLAMA_MODEL || "llama3";
    this.useVectorMatching = process.env.USE_VECTOR_MATCHING === "true";
  }

  async extractCategoriesAndLanguage(userMessage: string): Promise<ExtractionResult> {
    try {
      this.logger.debug(`Extracting categories and language from: ${userMessage}`);

      const language = this.vectorService.detectLanguage(userMessage);

      let categories: NewsCategory[];

      if (this.useVectorMatching) {
        categories = await this.vectorService.matchCategories(userMessage, 0.5);
      } else {
        const prompt = this.buildPrompt(userMessage);
        const response = await this.callOllama(prompt);
        const parsed = this.parseResponse(response);
        categories = parsed.categories;
      }

      this.logger.info(
        `Extracted - Categories: ${categories.join(", ")}, Language: ${language}`
      );

      return { categories, language };
    } catch (error) {
      this.logger.error(`Error in AI extraction: ${(error as Error).message}`);
      return {
        categories: [],
        language: UserLanguage.PORTUGUESE,
      };
    }
  }

  private buildPrompt(userMessage: string): string {
    const config = this.promptService.loadPrompt(this.promptName);
    const categories = config.categories || {};
    const availableCategories = Object.keys(categories).join(", ");

    return this.promptService.buildPrompt(this.promptName, {
      system: config.system || "",
      available_categories: availableCategories,
      user_message: userMessage,
      rules: config.rules || "",
    });
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.ollamaUrl}/api/generate`,
      {
        model: this.ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      },
      { timeout: 30000 }
    );
    return response.data.response;
  }

  private parseResponse(response: string): {
    categories: NewsCategory[];
    language: UserLanguage;
  } {
    try {
      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = cleaned.match(/\{.*?\}/s);
      if (!jsonMatch) {
        return {
          categories: [],
          language: UserLanguage.PORTUGUESE,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const categories = this.validateCategories(
        Array.isArray(parsed.categories) ? parsed.categories : []
      );
      const language = this.validateLanguage(parsed.language);

      return { categories, language };
    } catch (error) {
      this.logger.error(`Error parsing response: ${(error as Error).message}`);
      return {
        categories: [],
        language: UserLanguage.PORTUGUESE,
      };
    }
  }

  private validateCategories(categories: string[]): NewsCategory[] {
    const validCategories = Object.values(NewsCategory);

    const filtered = categories
      .map((cat) => cat.toLowerCase())
      .filter((cat) => validCategories.includes(cat as NewsCategory))
      .map((cat) => cat as NewsCategory);

    if (filtered.includes(NewsCategory.ALL)) {
      return [NewsCategory.ALL];
    }

    return filtered;
  }

  private validateLanguage(language: string): UserLanguage {
    const validLanguages = Object.values(UserLanguage);
    const normalized = language?.toLowerCase();

    if (validLanguages.includes(normalized as UserLanguage)) {
      return normalized as UserLanguage;
    }

    return UserLanguage.PORTUGUESE;
  }
}
