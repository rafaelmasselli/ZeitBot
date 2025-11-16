import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { IWhatsAppCommand } from "@domain/whatsapp";
import { CommandHandler } from "../command.handler";

@injectable()
export class HelpCommand implements IWhatsAppCommand {
  name = "help";
  description = "Show all available commands";

  constructor(
    @inject("CommandHandler") private commandHandler: CommandHandler
  ) {}

  async execute(message: Message): Promise<void> {
    let helpText = "*Available Commands:*\n\n";

    const commands = this.commandHandler.getCommands();
    commands.forEach((cmd) => {
      helpText += `*!${cmd.name}*: ${cmd.description}\n`;
    });

    await message.reply(helpText);
  }
}

