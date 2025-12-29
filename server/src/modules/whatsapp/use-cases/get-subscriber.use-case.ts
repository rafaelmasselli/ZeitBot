import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { SubscriberEntity } from "../entities/subscriber.entity";

@injectable()
export class GetSubscriberUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(phoneNumber: string): Promise<SubscriberEntity | null> {
    try {
      this.logger.info(`Getting subscriber info: ${phoneNumber}`);

      const subscriber = await this.subscriberRepository.findByPhone(
        phoneNumber
      );

      if (!subscriber) {
        this.logger.info(`Subscriber not found: ${phoneNumber}`);
      }

      return subscriber;
    } catch (error) {
      this.logger.error(
        `Error getting subscriber ${phoneNumber}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}

