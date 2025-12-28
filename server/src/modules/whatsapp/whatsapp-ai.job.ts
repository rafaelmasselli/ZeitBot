import { container } from "tsyringe";
import { SendPersonalizedNewsUseCase } from "./use-cases/send-personalized-news.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { CronJob } from "cron";

export function createPersonalizedNewsJob(
  sendPersonalizedNewsUseCase: SendPersonalizedNewsUseCase,
  logger: ILogger
): CronJob {
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  return new CronJob(
    cronInterval,
    async () => {
      try {
        logger.info("Starting scheduled personalized news delivery");
        await sendPersonalizedNewsUseCase.execute();
        logger.info("Scheduled personalized news delivery completed");
      } catch (error) {
        logger.error(
          `Error in scheduled personalized news: ${(error as Error).message}`
        );
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}

export async function initializeAIJobs(): Promise<void> {
  const sendPersonalizedNewsUseCase = container.resolve(
    SendPersonalizedNewsUseCase
  );
  const logger = container.resolve<ILogger>("ILogger");

  createPersonalizedNewsJob(sendPersonalizedNewsUseCase, logger);
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  logger.info(
    `AI-powered jobs initialized successfully (scheduled: ${cronInterval})`
  );
}

