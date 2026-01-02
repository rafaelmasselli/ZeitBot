import { injectable, inject } from "tsyringe";
import { UserRepository } from "@/shared/repositories/user.repository";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { NewsRecommendationService } from "@/shared/services/news-recommendation.service";
import { WhatsAppService } from "@/modules/whatsapp/services/whatsapp.service";
import { ILogger } from "@/shared/logger/logger.interface";
import { randomUUID } from "crypto";

@injectable()
export class SendAIRecommendationsUseCase {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
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

    const users = await this.userRepository.findAllActive();
    const activeUsers = users;

    if (activeUsers.length === 0) {
      this.logger.info("No active users found", {
        executionId,
        action: "checkUsers",
        totalUsers: users.length,
        activeUsers: 0,
      });
      return;
    }

    this.logger.info("Active users found", {
      executionId,
      action: "checkUsers",
      totalUsers: users.length,
      activeUsers: activeUsers.length,
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

    for (const user of activeUsers) {
      const sessionId = randomUUID();

      try {
        if (
          !user.preferences_embedding ||
          user.preferences_embedding.length === 0
        ) {
          this.logger.warn("User has no preferences, skipping", {
            executionId,
            sessionId,
            phoneNumber: user.phone_number,
            userId: user._id?.toString(),
            action: "checkPreferences",
          });
          skippedCount++;
          continue;
        }

        this.logger.debug("Generating recommendations", {
          executionId,
          sessionId,
          phoneNumber: user.phone_number,
          userId: user._id?.toString(),
          action: "generateRecommendations",
        });

        const recommendations =
          await this.recommendationService.recommendNewsForSubscriber(
            user,
            newsWithEmbeddings
          );

        if (recommendations.length === 0) {
          this.logger.info("No recommendations found for user", {
            executionId,
            sessionId,
            phoneNumber: user.phone_number,
            userId: user._id?.toString(),
            action: "generateRecommendations",
            recommendationsCount: 0,
          });
          skippedCount++;
          continue;
        }

        this.logger.info("Recommendations generated", {
          executionId,
          sessionId,
          phoneNumber: user.phone_number,
          userId: user._id?.toString(),
          action: "generateRecommendations",
          recommendationsCount: recommendations.length,
          topScore: recommendations[0]?.similarityScore,
        });

        const message =
          this.recommendationService.formatRecommendationMessage(
            recommendations
          );

        await this.whatsappService.sendMessage(
          user.phone_number,
          message
        );

        user.last_message_sent = new Date();
        await this.userRepository.update(
          user.phone_number,
          { last_message_sent: user.last_message_sent }
        );

        this.logger.info("Recommendations sent successfully", {
          executionId,
          sessionId,
          phoneNumber: user.phone_number,
          userId: user._id?.toString(),
          action: "sendMessage",
          recommendationsCount: recommendations.length,
          messageLength: message.length,
        });

        successCount++;
      } catch (error) {
        this.logger.error("Failed to send recommendations", {
          executionId,
          sessionId,
          phoneNumber: user.phone_number,
          userId: user._id?.toString(),
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
      totalProcessed: activeUsers.length,
      successCount,
      failedCount,
      skippedCount,
    });
  }
}
