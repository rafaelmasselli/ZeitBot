import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { ILogger } from "@shared/logger/logger.interface";
import { ICommandHandler, IWhatsAppCommand } from "@domain/whatsapp";

@injectable()
export class CommandHandler implements ICommandHandler {
  private commands: Map<string, IWhatsAppCommand> = new Map();
  private prefix = "!";

  constructor(@inject("ILogger") private readonly logger: ILogger) {}

  registerCommand(command: IWhatsAppCommand): void {
    this.commands.set(command.name, command);
    this.logger.info(`Command '${command.name}' registered`);
  }

  getCommands(): IWhatsAppCommand[] {
    return Array.from(this.commands.values());
  }

  async handleMessage(message: Message): Promise<void> {
    const content = message.body;

    if (!content.startsWith(this.prefix)) {
      return;
    }

    const args = content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName);
    if (!command) return;

    try {
      this.logger.info(`Executing command: ${commandName}`);
      await command.execute(message, args);
    } catch (error) {
      this.logger.error(`Error executing command ${commandName}: ${error}`);
      await message.reply("An error occurred while executing this command.");
    }
  }
}

