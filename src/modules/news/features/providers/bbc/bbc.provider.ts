import { injectable, inject } from "tsyringe";
import { INewsProvider } from "@/modules/news/interfaces/news-provider.interface";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { ILogger } from "@/shared/logger/logger.interface";
import { convertXmlToJson } from "@/shared/utils";
import { ApiService } from "@/shared/api.service";
import { BBCNewsStrategy } from "./bbc.strategy";
import { IBBCNewsAPIResponse } from "./bbc.interface";
import axios from "axios";

@injectable()
export class BBCNewsProvider extends ApiService implements INewsProvider {
  private readonly strategy: BBCNewsStrategy;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const baseURL = process.env.BBC_API_URL || "https://feeds.bbci.co.uk";
    super({ baseURL });
    this.strategy = new BBCNewsStrategy();
  }

  async fetchNews(): Promise<NewsEntity[]> {
    try {
      this.logger.info(`Fetching news from ${NewsPlatform.BBC}`);
      
      const response = await this.client.get("/portuguese/rss.xml", {
        responseType: "text",
      });
      
      const xmlData = response.data;
      const jsonData = await convertXmlToJson<IBBCNewsAPIResponse>(xmlData);
      
      return this.strategy.parse(jsonData);
    } catch (error) {
      this.logger.error(
        `Error fetching BBC news: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getDetails(news: NewsEntity): Promise<NewsEntity> {
    try {
      const response = await axios.get(news.link);
      const html = response.data;
      return this.strategy.convertHtmlToText(html, news);
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
        this.logger.info(`No news found from BBC`);
        return [];
      }

      const newsWithDetails = await Promise.all(
        news.map((newsItem) => this.getDetails(newsItem))
      );

      this.logger.info(`${newsWithDetails.length} news items processed from BBC`);
      return newsWithDetails;
    } catch (error) {
      this.logger.error(`Error processing BBC news: ${error}`);
      throw error;
    }
  }
}

