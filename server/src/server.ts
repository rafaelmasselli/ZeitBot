import "reflect-metadata";
import { setupContainer } from "@/config/container/container.config";
import { container } from "tsyringe";
import { DatabaseService } from "@/config/database/connect";
// import { ExpressApp } from "@/config/http/express.app";
import { ILogger } from "@/shared/logger/logger.interface";
import { IConfig } from "@/shared/config/config.interface";
// import { AppRoutes } from "@/routes/index.routes";
import { WhatsAppController } from "@/modules/whatsapp";
import { initializeJobs } from "@/modules/news/news.job";
import { initializeWhatsAppJobs } from "@/modules/whatsapp/whatsapp.job";
import { initializeAIJobs } from "@/modules/whatsapp/whatsapp-ai.job";

async function bootstrap() {
  try {
    setupContainer();

    const logger = container.resolve<ILogger>("ILogger");
    container.resolve<IConfig>("IConfig");

    logger.info("Starting ZeitBot Clean Architecture application");

    const databaseService = container.resolve(DatabaseService);
    await databaseService.connect();

    // const expressApp = new ExpressApp();

    // const appRoutes = container.resolve(AppRoutes);
    // expressApp.useRoutes("/api", appRoutes.getRouter());

    const whatsAppController = container.resolve(WhatsAppController);
    await whatsAppController.initialize();

    await initializeJobs();
    await initializeWhatsAppJobs();
    await initializeAIJobs();

    // expressApp.listen(config.PORT, () => {
    //   logger.info(`Server running on port ${config.PORT}`);
    //   logger.info(`Environment: ${config.NODE_ENV}`);
    //   logger.info(`API: http://localhost:${config.PORT}/api`);
    //   logger.info(`Health: http://localhost:${config.PORT}/api/health`);
    //   logger.info(`News: http://localhost:${config.PORT}/api/news`);
    // });

    // process.on("SIGINT", async () => {
    //   logger.info("Shutting down application...");
    //   await databaseService.disconnect();
    //   process.exit(0);
    // });
  } catch (error) {
    console.error("Error starting server:", error);
    // process.exit(1);
  }
}

bootstrap();
