import { injectable, inject, injectAll } from "tsyringe";
import { INewsProvider } from "@/modules/news/interfaces/news-provider.interface";
import { NewsEntity } from "@/modules/news/entities/news.entity";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class GetNewsUseCase {
  constructor(
    @injectAll("INewsProvider") private readonly newsProviders: INewsProvider[],
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<NewsEntity[]> {
    try {
      this.logger.info("Fetching news from all providers");
      
      const newsPromises = this.newsProviders.map((provider) =>
        provider.processNews()
      );
      
      const newsArrays = await Promise.all(newsPromises);
      const allNews = newsArrays.flat();
      
      this.logger.info(`${allNews.length} news items obtained in total`);
      return allNews;
    } catch (error) {
      this.logger.error(`Error fetching news: ${error}`);
      throw error;
    }
  }
}

