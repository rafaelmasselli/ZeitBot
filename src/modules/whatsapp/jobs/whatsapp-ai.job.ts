import { container } from "tsyringe";
import { SendAIRecommendationsUseCase } from "../features/notifications/use-cases/send-ai-recommendations.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { CronJob } from "cron";

export function createPersonalizedNewsJob(
  sendAIRecommendationsUseCase: SendAIRecommendationsUseCase,
  logger: ILogger
): CronJob {
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  return new CronJob(
    cronInterval,
    async () => {
      try {
        logger.info("Starting scheduled AI recommendations delivery");
        await sendAIRecommendationsUseCase.execute();
        logger.info("Scheduled AI recommendations delivery completed");
      } catch (error) {
        logger.error(
          `Error in scheduled AI recommendations: ${(error as Error).message}`
        );
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}

export async function initializeAIJobs(): Promise<void> {
  const sendAIRecommendationsUseCase = container.resolve(
    SendAIRecommendationsUseCase
  );
  const logger = container.resolve<ILogger>("ILogger");

  createPersonalizedNewsJob(sendAIRecommendationsUseCase, logger);
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  logger.info(
    `AI-powered jobs initialized successfully (scheduled: ${cronInterval})`
  );
}

