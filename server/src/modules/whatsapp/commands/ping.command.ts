import { injectable } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "../interfaces/whatsapp.interfaces";

@injectable()
export class PingCommand implements IWhatsAppCommand {
  name = "ping";
  description = "Check if the bot is online";

  async execute(message: Message): Promise<void> {
    await message.reply("Pong! The bot is online and working!");
  }
}

