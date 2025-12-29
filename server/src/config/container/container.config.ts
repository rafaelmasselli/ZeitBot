import "reflect-metadata";
import { container } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WinstonLogger } from "@/shared/logger/winston.logger";
import { IConfig } from "@/shared/config/config.interface";
import { EnvConfig } from "@/shared/config/env.config";
import { DatabaseService } from "@/config/database/connect";
import {
  IEmbeddingService,
  OllamaEmbeddingService,
  NewsRecommendationService,
} from "@/shared/services";
import {
  INewsRepository,
  INewsProvider,
  INewsAnalyzer,
  NewsRepository,
  BBCNewsProvider,
  BrazilIndeedProvider,
  GetNewsUseCase,
  SaveNewsUseCase,
  GenerateNewsEmbeddingsUseCase,
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
  PreferencesCommand,
  WhatsAppController,
  SendDailyMessagesUseCase,
  SendAIRecommendationsUseCase,
  SubscribeUserUseCase,
  UnsubscribeUserUseCase,
  GetSubscriberUseCase,
  UpdatePreferencesUseCase,
  SubscriberRepository,
} from "@/modules/whatsapp";
import { AppRoutes } from "@/routes/index.routes";

export function setupContainer(): void {
  container.registerSingleton<ILogger>("ILogger", WinstonLogger);
  container.registerSingleton<IConfig>("IConfig", EnvConfig);

  container.registerSingleton(DatabaseService);

  container.registerSingleton<IEmbeddingService>(
    "IEmbeddingService",
    OllamaEmbeddingService
  );
  container.registerSingleton(NewsRecommendationService);

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
  container.registerSingleton(GenerateNewsEmbeddingsUseCase);

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
  container.registerSingleton(SendAIRecommendationsUseCase);
  container.registerSingleton(SubscribeUserUseCase);
  container.registerSingleton(UnsubscribeUserUseCase);
  container.registerSingleton(GetSubscriberUseCase);
  container.registerSingleton(UpdatePreferencesUseCase);

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
  container.register<IWhatsAppCommand>("WhatsAppCommand", {
    useClass: PreferencesCommand,
  });

  container.registerSingleton(NewsRoutes);
  container.registerSingleton(AppRoutes);
}
