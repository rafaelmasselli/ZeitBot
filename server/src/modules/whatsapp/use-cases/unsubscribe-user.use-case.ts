import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";

@injectable()
export class UnsubscribeUserUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.info(`Unsubscribing user: ${phoneNumber}`);

      const result = await this.subscriberRepository.deactivate(phoneNumber);

      if (result) {
        this.logger.info(`User unsubscribed: ${phoneNumber}`);
      } else {
        this.logger.warn(`User not found: ${phoneNumber}`);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error unsubscribing user ${phoneNumber}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}

