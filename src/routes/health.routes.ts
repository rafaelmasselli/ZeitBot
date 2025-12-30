import { Router, Request, Response } from "express";

export class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.healthCheck.bind(this));
  }

  private healthCheck(req: Request, res: Response): void {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
