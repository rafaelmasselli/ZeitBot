import { injectable, inject } from "tsyringe";
import { INewsProvider } from "@/modules/news/interfaces/news-provider.interface";
import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { ILogger } from "@/shared/logger/logger.interface";
import { ApiService } from "@/shared/services/api.service";
import { convertXmlToJson } from "@/shared/utils";
import { CartaCapitalStrategy } from "./cartacapital.strategy";
import { ICartaCapitalRssResponse } from "./cartacapital.interface";

@injectable()
export class CartaCapitalProvider extends ApiService implements INewsProvider {
  private readonly strategy: CartaCapitalStrategy;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    const baseURL =
      process.env.CARTACAPITAL_URL || "https://www.cartacapital.com.br";
    super({
      baseURL,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    this.strategy = new CartaCapitalStrategy();
  }

  async fetchNews(): Promise<NewsEntity[]> {
    try {
      this.logger.info(`Fetching news from ${NewsPlatform.CARTACAPITAL}`);

      const response = await this.client.get("/feed/", {
        responseType: "text",
      });

      const jsonData = await convertXmlToJson<ICartaCapitalRssResponse>(
        response.data,
      );
      return this.strategy.parseFromRss(jsonData);
    } catch (error) {
      this.logger.error(
        `Error fetching CartaCapital news: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async processNews(): Promise<NewsEntity[]> {
    try {
      const news = await this.fetchNews();

      if (!news.length) {
        this.logger.info(`No news found from CartaCapital`);
        return [];
      }

      this.logger.info(`${news.length} news items processed from CartaCapital`);
      return news;
    } catch (error) {
      this.logger.error(`Error processing CartaCapital news: ${error}`);
      throw error;
    }
  }
}
