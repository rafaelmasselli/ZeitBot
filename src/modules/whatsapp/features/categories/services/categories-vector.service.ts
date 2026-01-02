import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { IEmbeddingService } from "@/shared/services/embedding.interface";
import { NewsCategory, UserLanguage } from "@/shared/entities/user.entity";
import { PromptTemplateService } from "@/shared/services/prompt-template.service";
import { INamePrompt } from "@/config/prompts/interface";

interface CategoryMatch {
  category: NewsCategory;
  similarity: number;
}

interface CategoryVectorData {
  description: string;
  examples: string[];
  embedding?: number[];
}

@injectable()
export class CategoriesVectorService {
  private categoryEmbeddings: Map<NewsCategory, number[]> = new Map();
  private initialized = false;

  constructor(
    @inject("ILogger") private logger: ILogger,
    @inject("IEmbeddingService") private embeddingService: IEmbeddingService,
    @inject(PromptTemplateService) private promptService: PromptTemplateService
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info(
        "Initializing multilingual category vector embeddings..."
      );

      const vectorData = this.promptService.loadPrompt(
        INamePrompt.CATEGORIES_VECTOR_DATA
      );
      const categories = vectorData.categories as Record<string, any>;

      for (const [categoryKey, data] of Object.entries(categories)) {
        const multilingualDesc =
          data.multilingual_description || data.description || "";
        const examples = (data.examples || []).join("\n");

        const textToEmbed = `${multilingualDesc}\n${examples}`;

        const embedding = await this.embeddingService.generateEmbedding(
          textToEmbed
        );

        this.categoryEmbeddings.set(categoryKey as NewsCategory, embedding);
        this.logger.debug(
          `Multilingual embedding generated for: ${categoryKey}`
        );
      }

      this.initialized = true;
      this.logger.info(
        `Category embeddings initialized (${this.categoryEmbeddings.size} categories, multilingual)`
      );
    } catch (error) {
      this.logger.error(
        `Error initializing embeddings: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async matchCategories(
    userMessage: string,
    threshold: number = 0.6
  ): Promise<NewsCategory[]> {
    await this.initialize();

    try {
      const userEmbedding = await this.embeddingService.generateEmbedding(
        userMessage
      );
      const matches: CategoryMatch[] = [];

      for (const [
        category,
        categoryEmbedding,
      ] of this.categoryEmbeddings.entries()) {
        const similarity = this.embeddingService.calculateSimilarity(
          userEmbedding,
          categoryEmbedding
        );

        matches.push({ category, similarity });
      }

      matches.sort((a, b) => b.similarity - a.similarity);

      const filtered = matches
        .filter((match) => match.similarity >= threshold)
        .map((match) => match.category);

      this.logger.info(
        `Matched categories: ${filtered.join(
          ", "
        )} from "${userMessage.substring(0, 50)}..."`
      );

      if (filtered.includes(NewsCategory.ALL)) {
        return [NewsCategory.ALL];
      }

      return filtered.length > 0 ? filtered : [];
    } catch (error) {
      this.logger.error(
        `Error matching categories: ${(error as Error).message}`
      );
      return [];
    }
  }

  detectLanguage(userMessage: string): UserLanguage {
    const vectorData = this.promptService.loadPrompt(
      INamePrompt.CATEGORIES_VECTOR_DATA
    );
    const languages = vectorData.languages as Record<
      string,
      { indicators: string[] }
    >;

    const lowerMessage = userMessage.toLowerCase();
    const languageScores: Map<UserLanguage, number> = new Map();

    for (const [lang, data] of Object.entries(languages)) {
      let score = 0;
      for (const indicator of data.indicators) {
        if (lowerMessage.includes(indicator.toLowerCase())) {
          score += 1;
        }
      }
      languageScores.set(lang as UserLanguage, score);
    }

    const sortedLanguages = Array.from(languageScores.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    const detectedLanguage = sortedLanguages[0]?.[0] || UserLanguage.PORTUGUESE;

    this.logger.info(
      `Language detected: ${detectedLanguage} for message: "${userMessage.substring(
        0,
        30
      )}..."`
    );

    return detectedLanguage;
  }
}
