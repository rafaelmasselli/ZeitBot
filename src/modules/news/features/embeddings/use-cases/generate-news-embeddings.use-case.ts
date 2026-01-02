import { injectable, inject } from "tsyringe";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { IEmbeddingService } from "@/shared/services/embedding.interface";
import { ILogger } from "@/shared/logger/logger.interface";
import { NewsEntity } from "@/modules/news/entities/news.entity";

@injectable()
export class GenerateNewsEmbeddingsUseCase {
  constructor(
    @inject("INewsRepository") private newsRepository: INewsRepository,
    @inject("IEmbeddingService") private embeddingService: IEmbeddingService,
    @inject("ILogger") private logger: ILogger
  ) {}

  async execute(news: NewsEntity): Promise<NewsEntity> {
    if (news.content_embedding && news.content_embedding.length > 0) {
      this.logger.info(`News "${news.title}" already has embedding, skipping`);
      return news;
    }

    this.logger.info(`Generating embedding for news: ${news.title}`);

    const text = `${news.title} ${news.description || ""} ${
      news.news_summary || ""
    }`;
    const embedding = await this.embeddingService.generateEmbedding(text);

    news.content_embedding = embedding;

    const updated = await this.newsRepository.create(news);

    this.logger.info(
      `Embedding generated for news: ${news.title} (${embedding.length} dimensions)`
    );

    return updated;
  }

  async executeForAll(): Promise<void> {
    this.logger.info("Generating embeddings for all news without embeddings");

    const allNews = await this.newsRepository.findAll();
    const newsWithoutEmbedding = allNews.filter(
      (news) => !news.content_embedding || news.content_embedding.length === 0
    );

    this.logger.info(
      `Found ${newsWithoutEmbedding.length} news without embeddings`
    );

    for (const news of newsWithoutEmbedding) {
      try {
        await this.execute(news);
      } catch (error) {
        this.logger.error(
          `Failed to generate embedding for news: ${news.title} - ${
            (error as Error).message
          }`
        );
      }
    }

    this.logger.info("Finished generating embeddings for all news");
  }
}
