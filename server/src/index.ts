import "reflect-metadata";
import "./config/container";
import express from "express";
import { container } from "tsyringe";
import { NewsController } from "./controllers";
import { DatabaseService } from "./database/connect";
import { logger } from "./utils";
import { errorHandler } from "./middlewares/error.middleware";
import { AppRoutes } from "./routes";
import { initJobs } from "./jobs";
import config from "./config";

const app = express();

app.use(express.json());
app.use(container.resolve(AppRoutes).getRouter());
app.use(errorHandler);

container
  .resolve(DatabaseService)
  .connect()
  .then(() => {
    app.listen(config.PORT, () => {
      logger.info(
        `Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
      initJobs(container.resolve(NewsController));
      logger.info("Cron jobs initialized");
    });
  })
  .catch((error: Error) => {
    logger.error(`Erro ao conectar ao MongoDB: ${error.message}`);
  });
