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
  INewsAnalyzer,
  NewsRepository,
  BBCNewsProvider,
  BrazilIndeedProvider,
  GetNewsUseCase,
  SaveNewsUseCase,
  AnalyzeNewsUseCase,
  GeminiNewsAnalyzer,
  SimpleNewsAnalyzer,
  OllamaNewsAnalyzer,
  NewsRoutes,
} from "@/modules/news";
import {
  IWhatsAppCommand,
  ISubscriberRepository,
  WhatsAppService,
  CommandHandler,
  HelpCommand,
  NewsCommand,
  SubscribeCommand,
  UnsubscribeCommand,
  MySubscriptionCommand,
  WhatsAppController,
  SendDailyMessagesUseCase,
  SendPersonalizedNewsUseCase,
  SubscribeUserUseCase,
  UnsubscribeUserUseCase,
  GetSubscriberUseCase,
  SubscriberRepository,
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
  container.registerSingleton(AnalyzeNewsUseCase);

  const aiProvider = process.env.AI_PROVIDER || "simple";
  
  if (aiProvider === "gemini") {
    container.registerSingleton<INewsAnalyzer>(
      "INewsAnalyzer",
      GeminiNewsAnalyzer
    );
  } else if (aiProvider === "ollama") {
    container.registerSingleton<INewsAnalyzer>(
      "INewsAnalyzer",
      OllamaNewsAnalyzer
    );
  } else {
    container.registerSingleton<INewsAnalyzer>(
      "INewsAnalyzer",
      SimpleNewsAnalyzer
    );
  }

  container.registerSingleton<ISubscriberRepository>(
    "ISubscriberRepository",
    SubscriberRepository
  );

  container.registerSingleton(WhatsAppService);
  container.registerSingleton<CommandHandler>("CommandHandler", CommandHandler);
  container.registerSingleton(WhatsAppController);

  container.registerSingleton(SendDailyMessagesUseCase);
  container.registerSingleton(SendPersonalizedNewsUseCase);
  container.registerSingleton(SubscribeUserUseCase);
  container.registerSingleton(UnsubscribeUserUseCase);
  container.registerSingleton(GetSubscriberUseCase);

  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: HelpCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: NewsCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: SubscribeCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: UnsubscribeCommand,
  });
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: MySubscriptionCommand,
  });

  container.registerSingleton(NewsRoutes);
  container.registerSingleton(AppRoutes);
}
