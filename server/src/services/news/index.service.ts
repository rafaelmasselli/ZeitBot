import { injectable, inject } from "tsyringe";
import { News } from "../../models/news";
import { BBCNewsService } from "./BBC/bbc.service";
import { BrazilIndeedService } from "./brazilIndeed/brazilIndeed.service";

@injectable()
export class NewsService {
  constructor(
    @inject("BBCNewsService") private readonly bbcNewsService: BBCNewsService,
    @inject("BrazilIndeedService")
    private readonly brazilIndeedService: BrazilIndeedService
  ) {}

  async getNews(): Promise<News[]> {
    const bbcNews = await this.bbcNewsService.processNews();
    const brazilIndeedNews = await this.brazilIndeedService.processNews();
    const news = [...bbcNews, ...brazilIndeedNews];
    return news;
  }
}
