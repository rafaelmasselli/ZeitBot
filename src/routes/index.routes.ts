import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { NewsRoutes } from "@/modules/news/routes/news.routes";
import { HealthRoutes } from "./health.routes";

@injectable()
export class AppRoutes {
  private router: Router;

  constructor(
    @inject(NewsRoutes) private readonly newsRoutes: NewsRoutes
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const healthRoutes = new HealthRoutes();
    
    this.router.use("/health", healthRoutes.getRouter());
    this.router.use("/news", this.newsRoutes.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}

