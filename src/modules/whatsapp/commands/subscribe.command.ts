import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "../interfaces/whatsapp.interfaces";
import { SubscribeUserUseCase } from "../use-cases/subscribe-user.use-case";
import { NewsCategory } from "../entities/subscriber.entity";

@injectable()
export class SubscribeCommand implements IWhatsAppCommand {
  name = "subscribe";
  description = "Subscribe to daily news with preferences";

  constructor(
    @inject(SubscribeUserUseCase) private subscribeUseCase: SubscribeUserUseCase
  ) {}

  async execute(message: Message, args: string[]): Promise<void> {
    try {
      const phoneNumber = message.from.replace("@c.us", "");
      const categories = this.parseCategories(args);

      const subscriber = await this.subscribeUseCase.execute({
        phoneNumber,
        categories: categories.length > 0 ? categories : undefined,
      });

      let response = "*✅ Inscrição realizada com sucesso!*\n\n";
      response += `📱 Número: ${phoneNumber}\n`;
      response += `📰 Categorias: ${subscriber.preferred_categories.join(", ")}\n`;
      response += `⏰ Horário: ${subscriber.preferred_hour}:00\n\n`;
      response += "Você receberá notícias diariamente!\n\n";
      response += "*Categorias disponíveis:*\n";
      response += "- technology\n- politics\n- sports\n";
      response += "- economy\n- health\n- entertainment\n";
      response += "- world\n- all\n\n";
      response += "Use: !subscribe technology politics";

      await message.reply(response);
    } catch (error) {
      await message.reply(
        "Erro ao processar inscrição. Tente novamente mais tarde."
      );
    }
  }

  private parseCategories(args: string[]): NewsCategory[] {
    const validCategories = Object.values(NewsCategory);
    return args
      .filter((arg) => validCategories.includes(arg as NewsCategory))
      .map((arg) => arg as NewsCategory);
  }
}

