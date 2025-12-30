import { injectable, inject } from "tsyringe";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { NewsRecommendationService } from "@/shared/services/news-recommendation.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { randomUUID } from "crypto";

@injectable()
export class SendAIRecommendationsUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("INewsRepository") private newsRepository: INewsRepository,
    private recommendationService: NewsRecommendationService,
    private whatsappService: WhatsAppService,
    @inject("ILogger") private logger: ILogger
  ) {
    this.logger.setDefaultContext({
      module: "ai",
      component: "SendAIRecommendationsUseCase",
    });
  }

  async execute(): Promise<void> {
    const executionId = randomUUID();

    this.logger.info("Starting AI-powered news recommendations job", {
      executionId,
      action: "execute",
    });

    const subscribers = await this.subscriberRepository.findAll();
    const activeSubscribers = subscribers.filter((sub) => sub.is_active);

    if (activeSubscribers.length === 0) {
      this.logger.info("No active subscribers found", {
        executionId,
        action: "checkSubscribers",
        totalSubscribers: subscribers.length,
        activeSubscribers: 0,
      });
      return;
    }

    this.logger.info("Active subscribers found", {
      executionId,
      action: "checkSubscribers",
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
    });

    const allNews = await this.newsRepository.findAll();
    const newsWithEmbeddings = allNews.filter(
      (news) => news.content_embedding && news.content_embedding.length > 0
    );

    if (newsWithEmbeddings.length === 0) {
      this.logger.warn("No news with embeddings found", {
        executionId,
        action: "checkNews",
        totalNews: allNews.length,
        newsWithEmbeddings: 0,
      });
      return;
    }

    this.logger.info("News with embeddings loaded", {
      executionId,
      action: "checkNews",
      totalNews: allNews.length,
      newsWithEmbeddings: newsWithEmbeddings.length,
    });

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const subscriber of activeSubscribers) {
      const sessionId = randomUUID();

      try {
        if (
          !subscriber.preferences_embedding ||
          subscriber.preferences_embedding.length === 0
        ) {
          this.logger.warn("Subscriber has no preferences, skipping", {
            executionId,
            sessionId,
            phoneNumber: subscriber.phone_number,
            subscriberId: subscriber._id?.toString(),
            action: "checkPreferences",
          });
          skippedCount++;
          continue;
        }

        this.logger.debug("Generating recommendations", {
          executionId,
          sessionId,
          phoneNumber: subscriber.phone_number,
          subscriberId: subscriber._id?.toString(),
          action: "generateRecommendations",
        });

        const recommendations =
          await this.recommendationService.recommendNewsForSubscriber(
            subscriber,
            newsWithEmbeddings
          );

        if (recommendations.length === 0) {
          this.logger.info("No recommendations found for subscriber", {
            executionId,
            sessionId,
            phoneNumber: subscriber.phone_number,
            subscriberId: subscriber._id?.toString(),
            action: "generateRecommendations",
            recommendationsCount: 0,
          });
          skippedCount++;
          continue;
        }

        this.logger.info("Recommendations generated", {
          executionId,
          sessionId,
          phoneNumber: subscriber.phone_number,
          subscriberId: subscriber._id?.toString(),
          action: "generateRecommendations",
          recommendationsCount: recommendations.length,
          topScore: recommendations[0]?.similarityScore,
        });

        const message =
          this.recommendationService.formatRecommendationMessage(
            recommendations
          );

        await this.whatsappService.sendMessage(
          subscriber.phone_number,
          message
        );

        subscriber.last_message_sent = new Date();
        await this.subscriberRepository.update(
          subscriber.phone_number,
          subscriber
        );

        this.logger.info("Recommendations sent successfully", {
          executionId,
          sessionId,
          phoneNumber: subscriber.phone_number,
          subscriberId: subscriber._id?.toString(),
          action: "sendMessage",
          recommendationsCount: recommendations.length,
          messageLength: message.length,
        });

        successCount++;
      } catch (error) {
        this.logger.error("Failed to send recommendations", {
          executionId,
          sessionId,
          phoneNumber: subscriber.phone_number,
          subscriberId: subscriber._id?.toString(),
          action: "sendMessage",
          error: (error as Error).message,
          errorStack: (error as Error).stack,
        });
        failedCount++;
      }
    }

    this.logger.info("AI recommendations job completed", {
      executionId,
      action: "complete",
      totalProcessed: activeSubscribers.length,
      successCount,
      failedCount,
      skippedCount,
    });
  }
}
