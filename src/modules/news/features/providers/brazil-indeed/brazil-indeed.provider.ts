import { injectable, inject } from "tsyringe";
import { INewsProvider } from "@/modules/news/interfaces/news-provider.interface";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { ILogger } from "@/shared/logger/logger.interface";
import { ApiService } from "@/shared/services/api.service";
import { convertXmlToJson } from "@/shared/utils";
import { BrazilIndeedStrategy } from "./brazil-indeed.strategy";
import { IBrasilDeFatoRssResponse } from "./brazil-indeed.interface";

@injectable()
export class BrazilIndeedProvider extends ApiService implements INewsProvider {
  private readonly strategy: BrazilIndeedStrategy;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const baseURL =
      process.env.BRAZIL_INDEED_URL || "https://www.brasildefato.com.br";
    super({
      baseURL,
      headers: {
        "User-Agent":
          "ZeitBot/1.0 (News aggregator; +https://github.com/zeitbot)",
      },
    });
    this.strategy = new BrazilIndeedStrategy();
  }

  async fetchNews(): Promise<NewsEntity[]> {
    try {
      this.logger.info(`Fetching news from ${NewsPlatform.BRAZIL_INDEED}`);

      const response = await this.client.get("/feed/", {
        responseType: "text",
      });

      const jsonData = await convertXmlToJson<IBrasilDeFatoRssResponse>(
        response.data,
      );
      return this.strategy.parseFromRss(jsonData);
    } catch (error) {
      this.logger.error(
        `Error fetching Brasil de Fato news: ${(error as Error).message}`,
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
        `Error getting news details "${news.title}": ${(error as Error).message}`,
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

      this.logger.info(
        `${news.length} news items processed from Brasil de Fato`,
      );
      return news;
    } catch (error) {
      this.logger.error(`Error processing Brasil de Fato news: ${error}`);
      throw error;
    }
  }
}
