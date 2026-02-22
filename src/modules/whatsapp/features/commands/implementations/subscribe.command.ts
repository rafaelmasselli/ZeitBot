import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "../interfaces/command.interface";
import { SubscribeUserUseCase } from "@/modules/whatsapp/features/subscription/use-cases/subscribe-user.use-case";
import { NewsCategory } from "@/shared/entities/user.entity";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class SubscribeCommand implements IWhatsAppCommand {
  name = "subscribe";
  description = "Subscribe to daily news with preferences";

  constructor(
    @inject(SubscribeUserUseCase)
    private subscribeUseCase: SubscribeUserUseCase,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(message: Message, args: string[]): Promise<void> {
    try {
      const phoneNumber = message.from.replace("@c.us", "");
      const categories = this.parseCategories(args);

      const subscriber = await this.subscribeUseCase.execute({
        phoneNumber,
        categories: categories.length > 0 ? categories : undefined,
      });

      let response = "*Inscrição realizada com sucesso!*\n\n";
      response += `Categorias: ${subscriber.preferred_categories.join(", ")}\n`;
      response += `Horário: ${subscriber.preferred_hour}:00\n\n`;
      response += "Você receberá notícias diariamente!\n\n";
      response += "*Categorias disponíveis:*\n";

      await message.reply(response);
    } catch (error) {
      this.logger.error(
        `Error subscribing user ${message.from}: ${(error as Error).message}`
      );
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
