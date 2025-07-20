import { injectable } from "tsyringe";
import { BaseNewsServiceRepository } from "@/repository/baseNews.service.repository";
import { BrazilIndeedStrategy } from "./brazilIndeed.strategy";
import { News } from "@/models/news";
import { INewsPlatform } from "@/types/index";

@injectable()
export class BrazilIndeedService extends BaseNewsServiceRepository {
  private readonly brazilIndeedStrategy: BrazilIndeedStrategy;

  constructor() {
    const baseURL = process.env.BRAZIL_INDEED_URL || "";
    super(INewsPlatform.G1, baseURL);
    this.brazilIndeedStrategy = new BrazilIndeedStrategy();
  }

  async fetchNewFromAPI(): Promise<any> {
    const response = await this.client.get("/", {
      responseType: "text",
    });

    const responseData = response.data;
    return responseData;
  }

  async getDetailsNews(news: News): Promise<News> {
    const response = await this.client.get(news.link, {
      responseType: "text",
    });

    const html = response.data;

    const details = this.brazilIndeedStrategy.convertHtmlToText(html, news);
    return details;
  }

  async processNews(): Promise<News[]> {
    const rawNews = await this.fetchNewFromAPI();
    return this.transformNews(rawNews);
  }

  async transformNews(rawNews: any): Promise<News[]> {
    const response = this.brazilIndeedStrategy.parse(rawNews);

    const processedNews = await Promise.all(
      response.map(async (news) => {
        return this.getDetailsNews(news);
      })
    );

    return processedNews;
  }
}
