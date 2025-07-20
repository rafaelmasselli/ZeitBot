import { News } from "@/models/news";

export abstract class BaseNewsStrategyRepository {
  abstract parse(response: any): News[];
  abstract convertHtmlToText(html: string, news: News): News;
  abstract mapItemToNews(item: any): News;
  abstract getDetailsNews?(html: string, news: News): News;
}
