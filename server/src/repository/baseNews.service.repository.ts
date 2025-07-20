import { News } from "../models/news";
import { logger } from "../utils/logger";
import { INewsPlatform } from "@/types/index";
import { ApiService } from "../services/api.service";

export interface IBaseNewsServiceRepository {
  fetchNewFromAPI(): Promise<News[]>;
  getDetailsNews(news: News): Promise<News>;
  transformNews(rawNews: any): Promise<News[]>;
}

export abstract class BaseNewsServiceRepository
  extends ApiService
  implements IBaseNewsServiceRepository
{
  constructor(
    protected readonly platform: INewsPlatform,
    protected readonly baseURL: string
  ) {
    super({ baseURL });
  }

  public async processNews(): Promise<News[]> {
    try {
      logger.info(
        `Iniciando processamento de notícias da plataforma ${this.platform}`
      );

      const rawNews = await this.fetchNewFromAPI();
      const processedNews = await this.transformNews(rawNews);

      if (!processedNews.length) {
        logger.info(
          `Nenhuma notícia encontrada para a plataforma: ${this.platform}`
        );
        return [];
      }

      const newsWithDetails = await Promise.all(
        processedNews.map(async (news) => {
          try {
            return await this.getDetailsNews(news);
          } catch (error) {
            logger.error(
              `Erro ao obter detalhes da notícia ${news.title}:`,
              error
            );
            return news;
          }
        })
      );

      return newsWithDetails;
    } catch (error) {
      logger.error(
        `Erro no processamento de notícias da ${this.platform}:`,
        error
      );
      throw error;
    }
  }

  abstract fetchNewFromAPI(): Promise<any>;
  abstract getDetailsNews(news: News): Promise<News>;
  abstract transformNews(rawNews: any): Promise<News[]>;
}
