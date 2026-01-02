import { injectable, inject, injectAll } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { WhatsAppService } from "../services/whatsapp.service";
import { CommandHandler } from "../features/commands/handlers/command.handler";
import { RegistrationFlowService } from "../features/registration/registration-flow.service";
import { UserManagerService } from "../services/user-manager.service";
import { UserContextService } from "../services/user-context.service";
import { IWhatsAppCommand } from "../features/commands/interfaces/command.interface";

@injectable()
export class WhatsAppController {
  constructor(
    @inject(WhatsAppService) private whatsAppService: WhatsAppService,
    @inject("CommandHandler") private commandHandler: CommandHandler,
    @inject(RegistrationFlowService)
    private registrationFlow: RegistrationFlowService,
    @inject(UserManagerService) private userManager: UserManagerService,
    @inject(UserContextService) private userContext: UserContextService,
    @injectAll("WhatsAppCommand") private commands: IWhatsAppCommand[],
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async initialize(): Promise<void> {
    try {
      this.commands.forEach((command) => {
        this.commandHandler.registerCommand(command);
      });

      this.whatsAppService.onMessage(async (message) => {
        if (message.fromMe) return;

        const phoneNumber = message.from.replace("@c.us", "");
        const user = await this.userManager.ensureUserExists(message);

        this.userContext.setUser(phoneNumber, user);

        try {
          const isCommand = message.body.startsWith("!");

          if (isCommand) {
            await this.commandHandler.handleMessage(message);
          } else {
            await this.registrationFlow.handleMessage(message, user);
          }
        } finally {
          this.userContext.clearUser(phoneNumber);
        }
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
