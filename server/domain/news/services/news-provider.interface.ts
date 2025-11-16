import { NewsEntity } from "../news.entity";

export interface INewsProvider {
  fetchNews(): Promise<NewsEntity[]>;
  processNews(): Promise<NewsEntity[]>;
}

