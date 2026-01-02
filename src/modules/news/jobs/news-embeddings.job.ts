import cron from "node-cron";
import { container } from "tsyringe";
import { GenerateNewsEmbeddingsUseCase } from "../features/embeddings/use-cases/generate-news-embeddings.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { IConfig } from "@/config/env/config.interface";

export function startNewsEmbeddingsJob(): void {
  const logger = container.resolve<ILogger>("ILogger");
  const config = container.resolve<IConfig>("IConfig");

  const cronInterval = config.NEWS_EMBEDDINGS_CRON_INTERVAL || "*/10 * * * *";

  logger.info(`News Embeddings Job scheduled with interval: ${cronInterval}`);

  const executeJob = async () => {
    try {
      logger.info("Starting news embeddings job execution");

      const generateEmbeddingsUseCase = container.resolve(
        GenerateNewsEmbeddingsUseCase
      );
      await generateEmbeddingsUseCase.executeForAll();

      logger.info("News embeddings job completed successfully");
    } catch (error) {
      logger.error(`News embeddings job failed: ${(error as Error).message}`);
    }
  };

  cron.schedule(cronInterval, executeJob);

  logger.info("Executing news embeddings job immediately on startup...");
  setTimeout(executeJob, 8000);
}
