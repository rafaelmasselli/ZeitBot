import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WhatsAppService } from "../services/whatsapp.service";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { INewsAnalyzer } from "@/modules/news/interfaces/news-analyzer.interface";
import { AnalyzeNewsUseCase } from "@/modules/news/use-cases/analyze-news.use-case";

@injectable()
export class SendPersonalizedNewsUseCase {
  constructor(
    @inject(WhatsAppService) private whatsAppService: WhatsAppService,
    @inject(AnalyzeNewsUseCase) private analyzeNewsUseCase: AnalyzeNewsUseCase,
    @inject("INewsAnalyzer") private newsAnalyzer: INewsAnalyzer,
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<void> {
    try {
      this.logger.info("Starting personalized news delivery");

      const subscribers = await this.subscriberRepository.findAllActive();

      if (subscribers.length === 0) {
        this.logger.warn("No active subscribers found");
        return;
      }

      const currentHour = new Date().getHours();
      const recipientsForCurrentHour = subscribers.filter(
        (sub) => sub.preferred_hour === currentHour
      );

      if (recipientsForCurrentHour.length === 0) {
        this.logger.info(`No subscribers configured for hour ${currentHour}`);
        return;
      }

      this.logger.info(
        `Analyzing news for ${recipientsForCurrentHour.length} subscriber(s)`
      );

      const analyzedNews = await this.analyzeNewsUseCase.execute();

      if (analyzedNews.length === 0) {
        this.logger.info("No news available to send");
        return;
      }

      const sendPromises = recipientsForCurrentHour.map(async (subscriber) => {
        try {
          const bestNews = this.newsAnalyzer.selectBestForCategories(
            analyzedNews,
            subscriber.preferred_categories,
            5
          );

          if (bestNews.length === 0) {
            this.logger.info(
              `No matching news for subscriber ${subscriber.phone_number}`
            );
            return;
          }

          const message = this.formatPersonalizedMessage(
            subscriber.name,
            bestNews
          );

          await this.whatsAppService.sendMessage(
            subscriber.phone_number,
            message
          );

          await this.subscriberRepository.update(subscriber.phone_number, {
            last_message_sent: new Date(),
          });

          this.logger.info(
            `Personalized news sent to ${subscriber.phone_number} (${bestNews.length} items)`
          );
        } catch (error) {
          this.logger.error(
            `Error sending to ${subscriber.phone_number}: ${(error as Error).message}`
          );
        }
      });

      await Promise.all(sendPromises);

      this.logger.info(
        `Personalized news delivery completed for ${recipientsForCurrentHour.length} recipient(s)`
      );
    } catch (error) {
      this.logger.error(
        `Error in personalized news delivery: ${(error as Error).message}`
      );
      throw error;
    }
  }

  private formatPersonalizedMessage(
    name: string | undefined,
    analyzedNews: any[]
  ): string {
    let message = name
      ? `*🌅 Bom dia, ${name}!*\n\n`
      : "*🌅 Bom dia!*\n\n";

    message += "*Suas notícias personalizadas:*\n\n";

    analyzedNews.forEach((analysis, index) => {
      const news = analysis.news;
      message += `*${index + 1}. ${news.title}*\n`;
      message += `📰 _${analysis.categories.join(", ")}_\n`;
      message += `${analysis.summary}\n`;
      message += `🔗 ${news.link}\n`;
      if (analysis.keywords.length > 0) {
        message += `🏷️ ${analysis.keywords.join(", ")}\n`;
      }
      message += "\n";
    });

    message += "_Selecionado especialmente para você pela IA! 🤖_";

    return message;
  }
}


