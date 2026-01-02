import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import { UserEntity } from "@/shared/entities/user.entity";
import { RegistrationStepFactory } from "./registration-step.factory";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class RegistrationFlowService {
  constructor(
    @inject(RegistrationStepFactory) private stepFactory: RegistrationStepFactory,
    @inject("ILogger") private logger: ILogger
  ) {}

  async handleMessage(message: Message, user: UserEntity): Promise<void> {
    try {
      const step = this.stepFactory.getStep(user.registration_step);
      await step.execute(message, user);
    } catch (error) {
      this.logger.error(
        `Error in registration flow: ${(error as Error).message}`,
        {
          phoneNumber: user.phone_number,
          step: user.registration_step,
          error: (error as Error).stack,
        }
      );

      await message.reply(
        "Ocorreu um erro no processo de cadastro. Por favor, tente novamente."
      );
    }
  }
}
