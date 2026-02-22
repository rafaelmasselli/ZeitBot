import "reflect-metadata";
import { container } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WinstonLogger } from "@/shared/logger/winston.logger";
import { IConfig } from "@/config/env/config.interface";
import { EnvConfig } from "@/config/env/env.config";
import { DatabaseService } from "@/config/database/connect";
import {
  OllamaEmbeddingService,
  NewsRecommendationService,
  PromptTemplateService,
} from "@/shared/services";
import { UserRepository } from "@/shared/repositories/user.repository";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";
import {
  INewsRepository,
  INewsProvider,
  INewsAnalyzer,
  NewsRoutes,
} from "@/modules/news";
import { NewsRepository } from "@/modules/news/features/storage/repositories/news.repository";
import { BBCNewsProvider } from "@/modules/news/features/providers/bbc/bbc.provider";
import { BrazilIndeedProvider } from "@/modules/news/features/providers/brazil-indeed/brazil-indeed.provider";
import { GetNewsUseCase } from "@/modules/news/features/storage/use-cases/get-news.use-case";
import { SaveNewsUseCase } from "@/modules/news/features/storage/use-cases/save-news.use-case";
import { GenerateNewsEmbeddingsUseCase } from "@/modules/news/features/embeddings/use-cases/generate-news-embeddings.use-case";
import { GeminiNewsAnalyzer } from "@/modules/news/features/analysis/services/gemini-news-analyzer.service";
import { SimpleNewsAnalyzer } from "@/modules/news/features/analysis/services/simple-news-analyzer.service";
import { OllamaNewsAnalyzer } from "@/modules/news/features/analysis/services/ollama-news-analyzer.service";
import {
  WhatsAppService,
  UserManagerService,
  UserContextService,
  WhatsAppController,
} from "@/modules/whatsapp";
import {
  IWhatsAppCommand,
  CommandHandler,
} from "@/modules/whatsapp/features/commands";
import {
  RegistrationFlowService,
  RegistrationStepFactory,
  StartRegistrationStep,
  CategoriesStep,
  CategoriesValidator,
  RegistrationPresenter,
  RegistrationPersister,
  ICategoriesValidator,
  IRegistrationPresenter,
  IRegistrationPersister,
} from "@/modules/whatsapp/features/registration";
import {
  CategoriesAIService,
  CategoriesVectorService,
} from "@/modules/whatsapp/features/categories";
import {
  TranslationService,
  MessageFormatterService,
} from "@/modules/whatsapp/shared";
import {
  HelpCommand,
  NewsCommand,
  SubscribeCommand,
  UnsubscribeCommand,
  MySubscriptionCommand,
  PreferencesCommand,
} from "@/modules/whatsapp/features/commands";
import {
  SendDailyMessagesUseCase,
  SendAIRecommendationsUseCase,
} from "@/modules/whatsapp/features/notifications";
import {
  SubscribeUserUseCase,
  UnsubscribeUserUseCase,
  GetSubscriberUseCase,
  UpdatePreferencesUseCase,
} from "@/modules/whatsapp/features/subscription";
import { AppRoutes } from "@/routes/index.routes";
import { IEmbeddingService } from "@/shared/interface/embedding.interface";

export function setupContainer(): void {
  container.registerSingleton<ILogger>("ILogger", WinstonLogger);
  container.registerSingleton<IConfig>("IConfig", EnvConfig);

  container.registerSingleton(DatabaseService);

  container.registerSingleton<IEmbeddingService>(
    "IEmbeddingService",
    OllamaEmbeddingService,
  );
  container.registerSingleton(NewsRecommendationService);
  container.registerSingleton(PromptTemplateService);
  container.registerSingleton(UserRepository);
  container.registerSingleton(CachedUserRepository);

  container.registerSingleton<INewsRepository>(
    "INewsRepository",
    NewsRepository,
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
      GeminiNewsAnalyzer,
    );
  } else if (aiProvider === "ollama") {
    container.registerSingleton<INewsAnalyzer>(
      "INewsAnalyzer",
      OllamaNewsAnalyzer,
    );
  } else {
    container.registerSingleton<INewsAnalyzer>(
      "INewsAnalyzer",
      SimpleNewsAnalyzer,
    );
  }

  container.registerSingleton(WhatsAppService);
  container.registerSingleton<CommandHandler>("CommandHandler", CommandHandler);

  container.registerSingleton(TranslationService);
  container.registerSingleton(MessageFormatterService);
  container.registerSingleton(CategoriesVectorService);
  container.registerSingleton(CategoriesAIService);

  container.registerSingleton<ICategoriesValidator>(
    "ICategoriesValidator",
    CategoriesValidator,
  );
  container.registerSingleton<IRegistrationPresenter>(
    "IRegistrationPresenter",
    RegistrationPresenter,
  );
  container.registerSingleton<IRegistrationPersister>(
    "IRegistrationPersister",
    RegistrationPersister,
  );

  container.registerSingleton(StartRegistrationStep);
  container.registerSingleton(CategoriesStep);
  container.registerSingleton(RegistrationStepFactory);
  container.registerSingleton(RegistrationFlowService);

  container.registerSingleton(UserManagerService);
  container.registerSingleton(UserContextService);
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
