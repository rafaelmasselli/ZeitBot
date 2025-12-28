import "reflect-metadata";
import { container } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WinstonLogger } from "@/shared/logger/winston.logger";
import { IConfig } from "@/shared/config/config.interface";
import { EnvConfig } from "@/shared/config/env.config";
import { DatabaseService } from "@/config/database/connect";
import {
  INewsRepository,
  INewsProvider,
  NewsRepository,
  BBCNewsProvider,
  BrazilIndeedProvider,
  GetNewsUseCase,
  SaveNewsUseCase,
  NewsRoutes,
} from "@/modules/news";
import {
  IWhatsAppCommand,
  WhatsAppService,
  CommandHandler,
  HelpCommand,
  NewsCommand,
  PingCommand,
  WhatsAppController,
  SendDailyMessagesUseCase,
} from "@/modules/whatsapp";
import { AppRoutes } from "@/routes/index.routes";

export function setupContainer(): void {
  container.registerSingleton<ILogger>("ILogger", WinstonLogger);
  container.registerSingleton<IConfig>("IConfig", EnvConfig);

  container.registerSingleton(DatabaseService);

  container.registerSingleton<INewsRepository>(
    "INewsRepository",
    NewsRepository
  );

  container.register<INewsProvider>("INewsProvider", {
    useClass: BBCNewsProvider,
  });
  container.register<INewsProvider>("INewsProvider", {
    useClass: BrazilIndeedProvider,
  });

  container.registerSingleton(GetNewsUseCase);
  container.registerSingleton(SaveNewsUseCase);

  container.registerSingleton(WhatsAppService);
  container.registerSingleton<CommandHandler>("CommandHandler", CommandHandler);
  container.registerSingleton(WhatsAppController);
  container.registerSingleton(SendDailyMessagesUseCase);

  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: HelpCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: NewsCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: PingCommand,
  });

  container.registerSingleton(NewsRoutes);
  container.registerSingleton(AppRoutes);
}
