import cron from "node-cron";
import { container } from "tsyringe";
import { SendAIRecommendationsUseCase } from "../features/notifications/use-cases/send-ai-recommendations.use-case";
import { GenerateNewsEmbeddingsUseCase } from "@/modules/news/features/embeddings/use-cases/generate-news-embeddings.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { IConfig } from "@/config/env/config.interface";

export function startWhatsAppAIRecommendationsJob(): void {
  const logger = container.resolve<ILogger>("ILogger");
  const config = container.resolve<IConfig>("IConfig");

  const cronInterval = config.WHATSAPP_AI_CRON_INTERVAL || "0 8 * * *";

  logger.info(
    `WhatsApp AI Recommendations Job scheduled with interval: ${cronInterval}`
  );

  const executeJob = async () => {
    try {
      logger.info("Starting AI recommendations job execution");

      const generateEmbeddingsUseCase = container.resolve(
        GenerateNewsEmbeddingsUseCase
      );
      await generateEmbeddingsUseCase.executeForAll();

      const sendRecommendationsUseCase = container.resolve(
        SendAIRecommendationsUseCase
      );
      await sendRecommendationsUseCase.execute();

      logger.info("AI recommendations job completed successfully");
    } catch (error) {
      logger.error(
        `AI recommendations job failed: ${(error as Error).message}`
      );
    }
  };

  cron.schedule(cronInterval, executeJob);

  logger.info("Executing AI recommendations job immediately on startup...");
  setTimeout(executeJob, 5000);
}
