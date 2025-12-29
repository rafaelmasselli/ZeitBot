import { NewsEntity } from "../entities/news.entity";

export interface INewsProvider {
  fetchNews(): Promise<NewsEntity[]>;
  processNews(): Promise<NewsEntity[]>;
}

