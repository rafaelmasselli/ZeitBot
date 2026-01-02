import { container } from "tsyringe";
import { SaveNewsUseCase } from "../features/storage/use-cases/save-news.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { CronJob } from "cron";

export function createNewsJob(
  saveNewsUseCase: SaveNewsUseCase,
  logger: ILogger
): CronJob {
  const cronInterval = process.env.NEWS_CRON_INTERVAL || "*/30 * * * *";

  return new CronJob(
    cronInterval,
    async () => {
      try {
        logger.info("Starting news processing");
        await saveNewsUseCase.execute();
        logger.info("News processing completed");
      } catch (error) {
        logger.error(`Error processing news: ${(error as Error).message}`);
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}

export async function initializeJobs(): Promise<void> {
  const saveNewsUseCase = container.resolve(SaveNewsUseCase);
  const logger = container.resolve<ILogger>("ILogger");

  createNewsJob(saveNewsUseCase, logger);
  const cronInterval = process.env.NEWS_CRON_INTERVAL || "*/30 * * * *";

  logger.info("Running news job immediately on startup...");
  try {
    await saveNewsUseCase.execute();
    logger.info("Initial news processing completed");
  } catch (error) {
    logger.error(
      `Error in initial news processing: ${(error as Error).message}`
    );
  }

  logger.info(`Jobs initialized successfully (scheduled: ${cronInterval})`);
}
