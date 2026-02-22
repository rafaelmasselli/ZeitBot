import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { DatabaseService } from "@/config/database";
import { ILogger } from "@/shared/logger";
import { IConfig } from "@/config/env";
import { startNewsEmbeddingsJob, initializeJobs } from "@/modules/news";
import { startWhatsAppAIRecommendationsJob } from "@/modules/whatsapp";

async function bootstrap() {
  try {
    setupContainer();

    const logger = container.resolve<ILogger>("ILogger");
    container.resolve<IConfig>("IConfig");

    logger.info("Starting ZeitBot application");

    const databaseService = container.resolve(DatabaseService);
    await databaseService.connect();

    await initializeJobs();
    startNewsEmbeddingsJob();

    startWhatsAppAIRecommendationsJob();
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

bootstrap();
