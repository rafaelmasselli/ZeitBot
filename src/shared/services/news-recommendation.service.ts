import { injectable, inject } from "tsyringe";
import { IEmbeddingService } from "../interface/embedding.interface";
import { ILogger } from "../logger/logger.interface";
import { NewsEntity } from "@/modules/news/entities/news.entity";
import { UserEntity } from "@/shared/entities/user.entity";

export interface NewsRecommendation {
  news: NewsEntity;
  similarityScore: number;
}

@injectable()
export class NewsRecommendationService {
  constructor(
    @inject("IEmbeddingService") private embeddingService: IEmbeddingService,
    @inject("ILogger") private logger: ILogger
  ) {}

  async generateNewsEmbedding(news: NewsEntity): Promise<number[]> {
    const text = `${news.title} ${news.description || ""} ${
      news.news_summary || ""
    }`;
    return this.embeddingService.generateEmbedding(text);
  }

  async generatePreferencesEmbedding(description: string): Promise<number[]> {
    return this.embeddingService.generateEmbedding(description);
  }

  async recommendNewsForSubscriber(
    user: UserEntity,
    newsList: NewsEntity[]
  ): Promise<NewsRecommendation[]> {
    if (
      !user.preferences_embedding ||
      user.preferences_embedding.length === 0
    ) {
      this.logger.warn(
        `User ${user.phone_number} has no preferences embedding, returning all news`
      );
      return newsList.map((news) => ({
        news,
        similarityScore: 0.5,
      }));
    }

    const recommendations: NewsRecommendation[] = [];

    for (const news of newsList) {
      if (!news.content_embedding || news.content_embedding.length === 0) {
        this.logger.warn(`News "${news.title}" has no embedding, skipping`);
        continue;
      }

      const similarity = this.embeddingService.calculateSimilarity(
        user.preferences_embedding,
        news.content_embedding
      );

      recommendations.push({
        news,
        similarityScore: similarity,
      });
    }

    const threshold = user.similarity_threshold || 0.6;
    const filtered = recommendations.filter(
      (rec) => rec.similarityScore >= threshold
    );

    const sorted = filtered.sort(
      (a, b) => b.similarityScore - a.similarityScore
    );

    this.logger.info(
      `Recommended ${sorted.length} news for user ${user.phone_number} (threshold: ${threshold})`
    );

    return sorted;
  }

  async recommendNewsForAllSubscribers(
    users: UserEntity[],
    newsList: NewsEntity[]
  ): Promise<Map<string, NewsRecommendation[]>> {
    const recommendationsMap = new Map<string, NewsRecommendation[]>();

    for (const user of users) {
      const recommendations = await this.recommendNewsForSubscriber(
        user,
        newsList
      );
      recommendationsMap.set(user.phone_number, recommendations);
    }

    return recommendationsMap;
  }

  formatRecommendationMessage(recommendations: NewsRecommendation[]): string {
    if (recommendations.length === 0) {
      return "No news matches your preferences at the moment.";
    }

    let message = `*Personalized News for You* \n\n`;
    message += `Found ${recommendations.length} news based on your interests:\n\n`;

    recommendations.slice(0, 5).forEach((rec, index) => {
      const scorePercent = (rec.similarityScore * 100).toFixed(0);
      message += `*${index + 1}.* ${rec.news.title}\n`;
      message += `Match: ${scorePercent}%\n`;
      if (rec.news.news_summary) {
        message += `${rec.news.news_summary}\n`;
      }
      message += `${rec.news.link}\n\n`;
    });

    return message;
  }
}
