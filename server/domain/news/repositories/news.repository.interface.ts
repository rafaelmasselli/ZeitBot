import { NewsEntity, NewsPlatform } from "../news.entity";

export interface INewsRepository {
  create(news: NewsEntity): Promise<NewsEntity>;
  findLastNews(platform: NewsPlatform): Promise<NewsEntity | null>;
  findOneByLink(link: string): Promise<NewsEntity | null>;
}

