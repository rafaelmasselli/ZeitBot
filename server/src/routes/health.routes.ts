import { Router, Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { ILogger } from "../utils";

@injectable()
export class HealthRoutes {
  private router: Router;

  constructor(@inject("ILogger") private readonly logger: ILogger) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.basicCheck.bind(this));
    this.router.get("/deep", this.deepCheck.bind(this));
  }

  private basicCheck(req: Request, res: Response): void {
    this.logger.debug("Health check requested");

    res.status(200).json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  }

  private async deepCheck(req: Request, res: Response): Promise<void> {
    this.logger.debug("Deep health check requested");

    try {
      res.status(200).json({
        success: true,
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          jobs: "ok",
        },
      });
    } catch (error) {
      this.logger.error(
        `Error in deep health check: ${(error as Error).message}`
      );

      res.status(500).json({
        success: false,
        status: "error",
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
