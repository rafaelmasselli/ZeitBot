import { SaveNewsUseCase } from "@modules/news";
import { ILogger } from "@shared/logger/logger.interface";
import { CronJob } from "cron";

export function createNewsJob(
  saveNewsUseCase: SaveNewsUseCase,
  logger: ILogger
): CronJob {
  return new CronJob(
    "*/30 * * * *",
    async () => {
      try {
        logger.info("🔄 Starting news processing");
        await saveNewsUseCase.execute();
        logger.info("✅ News processing completed");
      } catch (error) {
        logger.error(
          `❌ Error processing news: ${(error as Error).message}`
        );
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}
