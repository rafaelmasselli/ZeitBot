import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "@domain/whatsapp";
import { GetNewsUseCase } from "@modules/news";

@injectable()
export class NewsCommand implements IWhatsAppCommand {
  name = "news";
  description = "Show the latest news";

  constructor(@inject(GetNewsUseCase) private getNewsUseCase: GetNewsUseCase) {}

  async execute(message: Message): Promise<void> {
    try {
      const news = await this.getNewsUseCase.execute();

      if (news.length === 0) {
        await message.reply("No news available at the moment.");
        return;
      }

      const limitedNews = news.slice(0, 5);

      let newsText = "*📰 Latest News:*\n\n";
      limitedNews.forEach((item, index) => {
        newsText += `*${index + 1}. ${item.title}*\n`;
        newsText += `${item.description?.substring(0, 100)}...\n`;
        newsText += `🔗 ${item.link}\n\n`;
      });

      await message.reply(newsText);
    } catch (error) {
      await message.reply(
        "❌ Error fetching news. Please try again later."
      );
    }
  }
}

