import { injectable, inject } from "tsyringe";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { INewsRepository } from "@/modules/news/interfaces/news.repository.interface";
import { NewsRecommendationService } from "@/shared/services/news-recommendation.service";
import { WhatsAppService } from "../services/whatsapp.service";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class SendAIRecommendationsUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("INewsRepository") private newsRepository: INewsRepository,
    private recommendationService: NewsRecommendationService,
    private whatsappService: WhatsAppService,
    @inject("ILogger") private logger: ILogger
  ) {}

  async execute(): Promise<void> {
    this.logger.info("Starting AI-powered news recommendations job");

    const subscribers = await this.subscriberRepository.findAll();
    const activeSubscribers = subscribers.filter((sub) => sub.is_active);

    if (activeSubscribers.length === 0) {
      this.logger.info("No active subscribers found");
      return;
    }

    this.logger.info(`Found ${activeSubscribers.length} active subscribers`);

    const allNews = await this.newsRepository.findAll();
    const newsWithEmbeddings = allNews.filter(
      (news) => news.content_embedding && news.content_embedding.length > 0
    );

    if (newsWithEmbeddings.length === 0) {
      this.logger.warn("No news with embeddings found");
      return;
    }

    this.logger.info(
      `Processing ${newsWithEmbeddings.length} news with embeddings`
    );

    for (const subscriber of activeSubscribers) {
      try {
        if (
          !subscriber.preferences_embedding ||
          subscriber.preferences_embedding.length === 0
        ) {
          this.logger.warn(
            `Subscriber ${subscriber.phone_number} has no preferences, skipping`
          );
          continue;
        }

        const recommendations =
          await this.recommendationService.recommendNewsForSubscriber(
            subscriber,
            newsWithEmbeddings
          );

        if (recommendations.length === 0) {
          this.logger.info(
            `No recommendations for subscriber ${subscriber.phone_number}`
          );
          continue;
        }

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

        this.logger.info(
          `Sent ${recommendations.length} recommendations to ${subscriber.phone_number}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to send recommendations to ${subscriber.phone_number}: ${
            (error as Error).message
          }`
        );
      }
    }

    this.logger.info("AI recommendations job completed");
  }
}
