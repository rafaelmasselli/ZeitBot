import { injectable } from "tsyringe";
import { IBBCNewsAPIResponse } from "./bbc.interface";
import { convertXmlToJson, logger } from "../../../utils";
import { News } from "../../../models/news";
import { BBCNewsStrategy } from "./bbc.strategy";
import { INewsPlatform } from "@/types/index";
import axios from "axios";
import { BaseNewsServiceRepository } from "../../../repository/baseNews.service.repository";

@injectable()
export class BBCNewsService extends BaseNewsServiceRepository {
  private readonly bbcNewsStrategy: BBCNewsStrategy;

  constructor() {
    const baseURL = process.env.BBC_API_URL || "";
    super(INewsPlatform.BBC, baseURL);
    this.bbcNewsStrategy = new BBCNewsStrategy();
  }

  async fetchNewFromAPI(): Promise<IBBCNewsAPIResponse> {
    try {
      const response = await this.client.get("/portuguese/rss.xml", {
        responseType: "text",
      });
      const xmlData = response.data;
      const jsonData = await convertXmlToJson<IBBCNewsAPIResponse>(xmlData);
      return jsonData;
    } catch (error) {
      logger.error(
        `Erro ao buscar notícias da BBC: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getDetailsNews(news: News): Promise<News> {
    try {
      const response = await axios.get(news.link);
      const html = response.data;
      const details = this.bbcNewsStrategy.convertHtmlToText(html, news);
      return details;
    } catch (error) {
      logger.error(
        `Erro ao obter detalhes da notícia: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async transformNews(rawNews: IBBCNewsAPIResponse): Promise<News[]> {
    return this.bbcNewsStrategy.parse(rawNews);
  }
}
