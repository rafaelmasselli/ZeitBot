import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WhatsAppService } from "../services/whatsapp.service";
import { GetNewsUseCase } from "@/modules/news/use-cases/get-news.use-case";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";

@injectable()
export class SendDailyMessagesUseCase {
  constructor(
    @inject(WhatsAppService) private whatsAppService: WhatsAppService,
    @inject(GetNewsUseCase) private getNewsUseCase: GetNewsUseCase,
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<void> {
    try {
      this.logger.info("Starting daily WhatsApp messages");

      const subscribers = await this.subscriberRepository.findAllActive();

      if (subscribers.length === 0) {
        this.logger.warn("No active subscribers found");
        return;
      }

      this.logger.info(`Found ${subscribers.length} active subscriber(s)`);

      const currentHour = new Date().getHours();
      const recipientsForCurrentHour = subscribers.filter(
        (sub) => sub.preferred_hour === currentHour
      );

      if (recipientsForCurrentHour.length === 0) {
        this.logger.info(`No subscribers configured for hour ${currentHour}`);
        return;
      }

      const news = await this.getNewsUseCase.execute();
      const topNews = news.slice(0, 5);

      if (topNews.length === 0) {
        this.logger.info("No news available to send");
        return;
      }

      let message = "*🌅 Bom dia! Aqui estão as principais notícias:*\n\n";

      topNews.forEach((item, index) => {
        message += `*${index + 1}. ${item.title}*\n`;
        if (item.description) {
          message += `${item.description.substring(0, 150)}...\n`;
        }
        message += `🔗 ${item.link}\n\n`;
      });

      message += "_Tenha um ótimo dia! 🤖_";

      const sendPromises = recipientsForCurrentHour.map(async (subscriber) => {
        try {
          await this.whatsAppService.sendMessage(
            subscriber.phone_number,
            message
          );
          await this.subscriberRepository.update(subscriber.phone_number, {
            last_message_sent: new Date(),
          });
          this.logger.info(`Message sent to ${subscriber.phone_number}`);
        } catch (error) {
          this.logger.error(
            `Error sending message to ${subscriber.phone_number}: ${(error as Error).message}`
          );
        }
      });

      await Promise.all(sendPromises);
      this.logger.info(
        `Daily messages sent successfully to ${recipientsForCurrentHour.length} recipient(s)`
      );
    } catch (error) {
      this.logger.error(
        `Error sending daily messages: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
