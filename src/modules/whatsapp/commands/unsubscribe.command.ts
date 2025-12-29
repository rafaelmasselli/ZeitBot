import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "../interfaces/whatsapp.interfaces";
import { UnsubscribeUserUseCase } from "../use-cases/unsubscribe-user.use-case";

@injectable()
export class UnsubscribeCommand implements IWhatsAppCommand {
  name = "unsubscribe";
  description = "Unsubscribe from daily news";

  constructor(
    @inject(UnsubscribeUserUseCase)
    private unsubscribeUseCase: UnsubscribeUserUseCase
  ) {}

  async execute(message: Message): Promise<void> {
    try {
      const phoneNumber = message.from.replace("@c.us", "");

      const success = await this.unsubscribeUseCase.execute(phoneNumber);

      if (success) {
        await message.reply(
          "*✅ Você foi desinscrito com sucesso!*\n\n" +
            "Você não receberá mais notícias diárias.\n" +
            "Para se inscrever novamente, use !subscribe"
        );
      } else {
        await message.reply(
          "Você não está inscrito no serviço de notícias."
        );
      }
    } catch (error) {
      await message.reply(
        "Erro ao processar desinscrição. Tente novamente mais tarde."
      );
    }
  }
}

