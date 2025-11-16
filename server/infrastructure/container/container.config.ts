import "reflect-metadata";
import { container } from "tsyringe";
import { ILogger } from "@shared/logger/logger.interface";
import { WinstonLogger } from "@shared/logger/winston.logger";
import { IConfig } from "@shared/config/config.interface";
import { EnvConfig } from "@shared/config/env.config";
import { DatabaseService } from "@infrastructure/database/connect";
import { INewsRepository, INewsProvider } from "@domain/news";
import { NewsRepository } from "@infrastructure/repositories/news.repository";
import { BBCNewsProvider } from "@infrastructure/providers/news/bbc/bbc.provider";
import { BrazilIndeedProvider } from "@infrastructure/providers/news/brazil-indeed/brazil-indeed.provider";
import { GetNewsUseCase, SaveNewsUseCase } from "@modules/news";
import { WhatsAppController } from "@modules/whatsapp";
import {
  WhatsAppService,
  CommandHandler,
  HelpCommand,
  NewsCommand,
  PingCommand,
} from "@infrastructure/whatsapp";
import { IWhatsAppCommand } from "@domain/whatsapp";
import { NewsRoutes } from "@main/http/routes/news.routes";
import { AppRoutes } from "@main/http/routes/index.routes";

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
