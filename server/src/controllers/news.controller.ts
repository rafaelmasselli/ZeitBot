import { injectable, inject } from "tsyringe";
import { NewsRepository } from "../repository";
import { NewsService } from "../services";
import { ILogger } from "../utils";

@injectable()
export class NewsController {
  constructor(
    @inject("NewsRepository") private readonly newsRepository: NewsRepository,
    @inject("NewsService") private readonly newsService: NewsService,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async saveNews() {
    const news = await this.newsService.getNews();
    news.forEach((news) => {
      this.newsRepository.create(news).catch((error) => {
        this.logger.error(`Error saving news: ${error}`);
      });
    });
    return news;
  }
}
