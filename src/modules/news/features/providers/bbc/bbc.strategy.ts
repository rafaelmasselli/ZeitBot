import { NewsEntity, NewsPlatform } from "@/modules/news/entities/news.entity";
import { StringUtils } from "@/shared/utils";
import { IBBCNewsAPIResponse, IItemChannel } from "./bbc.interface";
import * as cheerio from "cheerio";

export class BBCNewsStrategy {
  private joinStringArray(values: string[]): string {
    return values.join(",");
  }

  public mapItemToNews(item: IItemChannel): NewsEntity {
    const news = new NewsEntity();
    news.title = this.joinStringArray(item.title);
    news.description = this.joinStringArray(item.description);
    news.link = item.link[0];
    news.image = item["media:thumbnail"]
      ? item["media:thumbnail"][0].$.url
      : "";
    news.date = new Date(item.pubDate[0]);
    news.enterprise = NewsPlatform.BBC;
    news.topics = [];
    return news;
  }

  public parse(response: IBBCNewsAPIResponse): NewsEntity[] {
    const uniqueNewsMap: Map<string, NewsEntity> = new Map();

    if (
      !response.rss ||
      !response.rss.channel ||
      !response.rss.channel[0] ||
      !response.rss.channel[0].item
    ) {
      return [];
    }

    const channelItems = response.rss.channel[0].item;

    channelItems.forEach((item: IItemChannel) => {
      const news = this.mapItemToNews(item);
      const titleKey = StringUtils.removeSpaces(news.title);
      uniqueNewsMap.set(titleKey, news);
    });

    return Array.from(uniqueNewsMap.values());
  }

  public convertHtmlToText(html: string, news: NewsEntity): NewsEntity {
    const $ = cheerio.load(html);

    const title = $(".bbc-14gqcmb").text().trim();

    const articleText = $(".bbc-hhl7in")
      .map((_, element) => {
        return $(element).text().trim();
      })
      .get()
      .join("\n\n");

    const images = $(".bbc-139onq")
      .map((_, element) => {
        return $(element).attr("src");
      })
      .get();

    const topics = $(".bbc-1uuxkzb a")
      .map((_, element) => {
        return $(element).text().trim();
      })
      .get();

    const newUpdated = new NewsEntity();
    Object.assign(newUpdated, news);
    newUpdated.title = title || news.title;
    newUpdated.description = articleText || news.description;
    newUpdated.image = images[0] ?? news.image;
    newUpdated.topics = topics.length > 0 ? topics : [];

    return newUpdated;
  }
}

