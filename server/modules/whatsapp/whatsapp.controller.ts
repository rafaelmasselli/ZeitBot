import { injectable, inject, injectAll } from "tsyringe";
import { ILogger } from "@shared/logger/logger.interface";
import { WhatsAppService, CommandHandler } from "@infrastructure/whatsapp";
import { IWhatsAppCommand } from "@domain/whatsapp";

@injectable()
export class WhatsAppController {
  constructor(
    @inject(WhatsAppService) private whatsAppService: WhatsAppService,
    @inject("CommandHandler") private commandHandler: CommandHandler,
    @injectAll("WhatsAppCommand") private commands: IWhatsAppCommand[],
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async initialize(): Promise<void> {
    try {
      this.commands.forEach(command => {
        this.commandHandler.registerCommand(command);
      });

      this.whatsAppService.onMessage(async (message) => {
        if (message.fromMe) return;
        
        await this.commandHandler.handleMessage(message);
      });

      await this.whatsAppService.initialize();
      
      this.logger.info("WhatsApp controller initialized successfully");
    } catch (error) {
      this.logger.error(`Error initializing WhatsApp controller: ${error}`);
      throw error;
    }
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await this.whatsAppService.sendMessage(to, message);
  }
}

