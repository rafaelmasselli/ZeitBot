import { INewsPlatform } from "@/types/index";
import { News } from "../../../models/news";
import { Utils } from "../../../utils/utils";
import { IBBCNewsAPIResponse, IItemChannel } from "./bbc.interface";
import * as cheerio from "cheerio";
import { BaseNewsStrategyRepository } from "@/repository/baseNews.strategy.repository";

export class BBCNewsStrategy implements BaseNewsStrategyRepository {
  private joinStringArray(values: string[]): string {
    return values.join(",");
  }

  public mapItemToNews(item: IItemChannel): News {
    const news = new News();
    news.title = this.joinStringArray(item.title);
    news.description = this.joinStringArray(item.description);
    news.link = item.link[0];
    news.image = item["media:thumbnail"]
      ? item["media:thumbnail"][0].$.url
      : "";
    news.date = new Date(item.pubDate[0]);
    news.enterprise = INewsPlatform.BBC;
    return news;
  }

  public parse(response: IBBCNewsAPIResponse): News[] {
    const uniqueNewsMap: Map<string, News> = new Map();

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
      const titleKey = Utils.removeSpaces(news.title);
      uniqueNewsMap.set(titleKey, news);
    });

    return Array.from(uniqueNewsMap.values());
  }

  public convertHtmlToText(html: string, news: News): News {
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

    const date = $(".bbc-1dafq0j").first().text().trim();

    const newUpdated = new News();
    newUpdated.title = title;
    newUpdated.description = articleText;
    newUpdated.image = images[0] ?? news.image;
    newUpdated.date = new Date(date);
    newUpdated.topics = topics;
    newUpdated.enterprise = news.enterprise;
    newUpdated.link = news.link;
    newUpdated.date = news.date;

    return newUpdated;
  }
}
