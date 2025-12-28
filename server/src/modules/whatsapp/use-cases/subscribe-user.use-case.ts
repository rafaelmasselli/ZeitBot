import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { SubscriberEntity, NewsCategory } from "../entities/subscriber.entity";

export interface SubscribeUserDTO {
  phoneNumber: string;
  name?: string;
  categories?: NewsCategory[];
  preferredHour?: number;
}

@injectable()
export class SubscribeUserUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(data: SubscribeUserDTO): Promise<SubscriberEntity> {
    try {
      this.logger.info(`Subscribing user: ${data.phoneNumber}`);

      const existingSubscriber = await this.subscriberRepository.findByPhone(
        data.phoneNumber
      );

      if (existingSubscriber) {
        if (!existingSubscriber.is_active) {
          const updated = await this.subscriberRepository.update(
            data.phoneNumber,
            {
              is_active: true,
              preferred_categories: data.categories || existingSubscriber.preferred_categories,
              preferred_hour: data.preferredHour || existingSubscriber.preferred_hour,
              name: data.name || existingSubscriber.name,
            }
          );
          this.logger.info(`Reactivated subscriber: ${data.phoneNumber}`);
          return updated!;
        }

        const updated = await this.subscriberRepository.update(
          data.phoneNumber,
          {
            preferred_categories: data.categories || existingSubscriber.preferred_categories,
            preferred_hour: data.preferredHour || existingSubscriber.preferred_hour,
            name: data.name || existingSubscriber.name,
          }
        );
        this.logger.info(`Updated subscriber preferences: ${data.phoneNumber}`);
        return updated!;
      }

      const subscriber = new SubscriberEntity();
      subscriber.phone_number = data.phoneNumber;
      subscriber.name = data.name;
      subscriber.preferred_categories = data.categories || [NewsCategory.ALL];
      subscriber.preferred_hour = data.preferredHour || 8;
      subscriber.is_active = true;

      const created = await this.subscriberRepository.create(subscriber);
      this.logger.info(`New subscriber created: ${data.phoneNumber}`);
      return created;
    } catch (error) {
      this.logger.error(
        `Error subscribing user ${data.phoneNumber}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}

