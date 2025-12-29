import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "../interfaces/whatsapp.interfaces";
import { GetSubscriberUseCase } from "../use-cases/get-subscriber.use-case";

@injectable()
export class MySubscriptionCommand implements IWhatsAppCommand {
  name = "mysubscription";
  description = "View your subscription preferences";

  constructor(
    @inject(GetSubscriberUseCase)
    private getSubscriberUseCase: GetSubscriberUseCase
  ) {}

  async execute(message: Message): Promise<void> {
    try {
      const phoneNumber = message.from.replace("@c.us", "");

      const subscriber = await this.getSubscriberUseCase.execute(phoneNumber);

      if (!subscriber) {
        await message.reply(
          "*❌ Você não está inscrito*\n\n" +
            "Use !subscribe para se inscrever nas notícias diárias."
        );
        return;
      }

      if (!subscriber.is_active) {
        await message.reply(
          "*⚠️ Sua inscrição está inativa*\n\n" +
            "Use !subscribe para reativar."
        );
        return;
      }

      let response = "*📋 Suas Preferências*\n\n";
      response += `📱 Número: ${subscriber.phone_number}\n`;
      if (subscriber.name) {
        response += `👤 Nome: ${subscriber.name}\n`;
      }
      response += `📰 Categorias: ${subscriber.preferred_categories.join(
        ", "
      )}\n`;
      response += `⏰ Horário: ${subscriber.preferred_hour}:00\n`;
      response += `📅 Inscrito em: ${new Date(
        subscriber.created_at
      ).toLocaleDateString()}\n\n`;
      response += "*Comandos:*\n";
      response += "• !subscribe [categorias] - Atualizar preferências\n";
      response += "• !unsubscribe - Desinscrever";

      await message.reply(response);
    } catch (error) {
      await message.reply(
        "Erro ao buscar suas informações. Tente novamente mais tarde."
      );
    }
  }
}
