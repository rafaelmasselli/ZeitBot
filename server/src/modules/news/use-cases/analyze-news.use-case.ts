import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { INewsAnalyzer, NewsAnalysisResult } from "../interfaces/news-analyzer.interface";
import { GetNewsUseCase } from "./get-news.use-case";

@injectable()
export class AnalyzeNewsUseCase {
  constructor(
    @inject("INewsAnalyzer") private newsAnalyzer: INewsAnalyzer,
    @inject(GetNewsUseCase) private getNewsUseCase: GetNewsUseCase,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<NewsAnalysisResult[]> {
    try {
      this.logger.info("Starting news analysis");

      const news = await this.getNewsUseCase.execute();

      if (news.length === 0) {
        this.logger.info("No news to analyze");
        return [];
      }

      const analyzed = await this.newsAnalyzer.analyzeBatch(news);

      this.logger.info(`Analyzed ${analyzed.length} news items`);
      return analyzed;
    } catch (error) {
      this.logger.error(
        `Error analyzing news: ${(error as Error).message}`
      );
      throw error;
    }
  }
}


