import { injectable, inject } from "tsyringe";
import { INewsProvider, NewsEntity, NewsPlatform } from "@domain/news";
import { ILogger } from "@shared/logger/logger.interface";
import { ApiService } from "@infrastructure/services/api.service";
import { BrazilIndeedStrategy } from "./brazil-indeed.strategy";

@injectable()
export class BrazilIndeedProvider extends ApiService implements INewsProvider {
  private readonly strategy: BrazilIndeedStrategy;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const baseURL = process.env.BRAZIL_INDEED_URL || "https://www.brasildefato.com.br";
    super({ baseURL });
    this.strategy = new BrazilIndeedStrategy();
  }

  async fetchNews(): Promise<NewsEntity[]> {
    try {
      this.logger.info(`Fetching news from ${NewsPlatform.BRAZIL_INDEED}`);
      
      const response = await this.client.get("/", {
        responseType: "text",
      });
      
      return this.strategy.parse(response.data);
    } catch (error) {
      this.logger.error(
        `Error fetching Brasil de Fato news: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getDetails(news: NewsEntity): Promise<NewsEntity> {
    try {
      const response = await this.client.get(news.link, {
        responseType: "text",
      });

      return this.strategy.getDetails(response.data, news);
    } catch (error) {
      this.logger.error(
        `Error getting news details "${news.title}": ${(error as Error).message}`
      );
      return news;
    }
  }

  async processNews(): Promise<NewsEntity[]> {
    try {
      const news = await this.fetchNews();
      
      if (!news.length) {
        this.logger.info(`No news found from Brasil de Fato`);
        return [];
      }

      const newsWithDetails = await Promise.all(
        news.map((newsItem) => this.getDetails(newsItem))
      );

      this.logger.info(`${newsWithDetails.length} news items processed from Brasil de Fato`);
      return newsWithDetails;
    } catch (error) {
      this.logger.error(`Error processing Brasil de Fato news: ${error}`);
      throw error;
    }
  }
}

