import { injectable, inject } from "tsyringe";
import { INewsRepository } from "@domain/news";
import { ILogger } from "@shared/logger/logger.interface";
import { GetNewsUseCase } from "./get-news.use-case";
import { NewsEntity } from "@domain/news/news.entity";

@injectable()
export class SaveNewsUseCase {
  constructor(
    @inject("INewsRepository") private readonly newsRepository: INewsRepository,
    @inject(GetNewsUseCase) private readonly getNewsUseCase: GetNewsUseCase,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<NewsEntity[]> {
    try {
      this.logger.info("Starting news save process");
      
      const news = await this.getNewsUseCase.execute();
      
      const savedNews = await Promise.all(
        news.map(async (newsItem) => {
          try {
            return await this.newsRepository.create(newsItem);
          } catch (error) {
            this.logger.error(
              `Error saving news "${newsItem.title}": ${error}`
            );
            throw error;
          }
        })
      );

      this.logger.info(`${savedNews.length} news items saved successfully`);
      return savedNews;
    } catch (error) {
      this.logger.error(`Error saving news: ${error}`);
      throw error;
    }
  }
}

