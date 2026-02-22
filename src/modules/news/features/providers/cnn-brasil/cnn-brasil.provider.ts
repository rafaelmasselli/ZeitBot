import { injectable, inject } from "tsyringe";
import { INewsProvider } from "@/modules/news/interfaces/news-provider.interface";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { ILogger } from "@/shared/logger/logger.interface";
import { ApiService } from "@/shared/services/api.service";
import { convertXmlToJson } from "@/shared/utils";
import { CnnBrasilStrategy } from "./cnn-brasil.strategy";
import { ICnnBrasilRssResponse } from "./cnn-brasil.interface";

@injectable()
export class CnnBrasilProvider extends ApiService implements INewsProvider {
  private readonly strategy: CnnBrasilStrategy;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const baseURL =
      process.env.CNN_BRASIL_URL || "https://www.cnnbrasil.com.br";
    super({
      baseURL,
      headers: {
        "User-Agent":
          "ZeitBot/1.0 (News aggregator; +https://github.com/zeitbot)",
      },
    });
    this.strategy = new CnnBrasilStrategy();
  }

  async fetchNews(): Promise<NewsEntity[]> {
    try {
      this.logger.info(`Fetching news from ${NewsPlatform.CNN_BRASIL}`);

      const response = await this.client.get("/feed/", {
        responseType: "text",
      });

      const jsonData =
        await convertXmlToJson<ICnnBrasilRssResponse>(response.data);
      return this.strategy.parseFromRss(jsonData);
    } catch (error) {
      this.logger.error(
        `Error fetching CNN Brasil news: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async processNews(): Promise<NewsEntity[]> {
    try {
      const news = await this.fetchNews();

      if (!news.length) {
        this.logger.info(`No news found from CNN Brasil`);
        return [];
      }

      this.logger.info(`${news.length} news items processed from CNN Brasil`);
      return news;
    } catch (error) {
      this.logger.error(`Error processing CNN Brasil news: ${error}`);
      throw error;
    }
  }
}
