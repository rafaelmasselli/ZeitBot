import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { HealthRoutes } from "./health.routes";
import { NewsRoutes } from "./news.routes";

@injectable()
class AppRoutes {
  private router: Router;

  constructor(
    @inject("HealthRoutes") private readonly healthRoutes: HealthRoutes,
    @inject("NewsRoutes") private readonly newsRoutes: NewsRoutes
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/health", this.healthRoutes.getRouter());
    this.router.use("/news", this.newsRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}

export { AppRoutes, HealthRoutes, NewsRoutes };
