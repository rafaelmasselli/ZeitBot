import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import * as cheerio from "cheerio";
import {
  ICartaCapitalRssResponse,
  ICartaCapitalRssItem,
} from "./cartacapital.interface";

export class CartaCapitalStrategy {
  public parseFromRss(response: ICartaCapitalRssResponse): NewsEntity[] {
    const items: ICartaCapitalRssItem[] =
      response?.rss?.channel?.[0]?.item ?? [];
    const newsItems: NewsEntity[] = [];

    for (const item of items) {
      const title = Array.isArray(item.title) ? item.title[0] : "";
      const link = Array.isArray(item.link) ? item.link[0] : "";
      if (!title?.trim() || !link?.trim()) continue;

      const news = new NewsEntity();
      news.title = String(title).trim();
      news.link = String(link).trim();
      news.enterprise = NewsPlatform.CARTACAPITAL;
      news.date = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date();
      news.description = this.extractDescription(item.description);
      news.image = "";
      news.topics = this.extractTopics(item);

      newsItems.push(news);
    }

    return newsItems;
  }

  private extractDescription(description: string[] | undefined): string {
    if (!description?.[0]) return "";
    const text = String(description[0]).trim();
    const $ = cheerio.load(text);
    const firstP = $("p").first().text().trim();
    return firstP || $.text().trim().slice(0, 500) || text.slice(0, 500);
  }

  private extractTopics(item: ICartaCapitalRssItem): string[] {
    const categories = item.category ?? [];
    if (!Array.isArray(categories)) return [];
    return categories
      .map((c) =>
        typeof c === "string" ? c : ((c as { _?: string })?._ ?? ""),
      )
      .filter(Boolean)
      .slice(0, 5);
  }
}
