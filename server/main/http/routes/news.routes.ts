import { Router, Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { ILogger } from "@shared/logger/logger.interface";
import { GetNewsUseCase } from "@modules/news";

@injectable()
export class NewsRoutes {
  private router: Router;

  constructor(
    @inject(GetNewsUseCase) private readonly getNewsUseCase: GetNewsUseCase,
    @inject("ILogger") private readonly logger: ILogger
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.getNews.bind(this));
  }

  private async getNews(req: Request, res: Response): Promise<void> {
    try {
      const news = await this.getNewsUseCase.execute();
      res.status(200).json({
        success: true,
        count: news.length,
        data: news,
      });
    } catch (error) {
      this.logger.error(
        `Error in news endpoint: ${(error as Error).message}`
      );
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

