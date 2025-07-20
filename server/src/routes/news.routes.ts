import { Router, Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { ILogger } from "../utils";
import { BBCNewsService, BrazilIndeedService } from "../services";

@injectable()
export class NewsRoutes {
  private router: Router;

  constructor(
    @inject("BrazilIndeedService")
    private readonly brazilIndeedService: BrazilIndeedService,
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
      const news = await this.brazilIndeedService.processNews();
      res.status(200).json({
        success: true,
        news,
      });
    } catch (error) {
      this.logger.error(
        `Error in BBC News endpoint: ${(error as Error).message}`
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
