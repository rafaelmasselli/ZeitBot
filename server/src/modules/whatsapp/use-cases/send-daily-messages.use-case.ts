import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WhatsAppService } from "../services/whatsapp.service";
import { GetNewsUseCase } from "@/modules/news/use-cases/get-news.use-case";

@injectable()
export class SendDailyMessagesUseCase {
  constructor(
    @inject(WhatsAppService) private whatsAppService: WhatsAppService,
    @inject(GetNewsUseCase) private getNewsUseCase: GetNewsUseCase,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(): Promise<void> {
    try {
      this.logger.info("Starting daily WhatsApp messages");

      const recipients =
        process.env.WHATSAPP_DAILY_RECIPIENTS?.split(",") || [];

      if (recipients.length === 0) {
        this.logger.warn("No recipients configured for daily messages");
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

      const sendPromises = recipients.map(async (recipient) => {
        try {
          const phoneNumber = recipient.trim();
          await this.whatsAppService.sendMessage(phoneNumber, message);
          this.logger.info(`Message sent to ${phoneNumber}`);
        } catch (error) {
          this.logger.error(
            `Error sending message to ${recipient}: ${(error as Error).message}`
          );
        }
      });

      await Promise.all(sendPromises);
      this.logger.info(
        `Daily messages sent successfully to ${recipients.length} recipient(s)`
      );
    } catch (error) {
      this.logger.error(
        `Error sending daily messages: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
