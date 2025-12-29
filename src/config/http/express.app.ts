import express, { Application, Router } from "express";
import cors from "cors";
import helmet from "helmet";

export class ExpressApp {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(helmet());
  }

  public useRoutes(prefix: string, router: Router): void {
    this.app.use(prefix, router);
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(port: number, callback: () => void): void {
    this.app.listen(port, callback);
  }
}

