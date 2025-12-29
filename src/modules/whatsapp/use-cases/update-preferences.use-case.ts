import { injectable, inject } from "tsyringe";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";
import { IEmbeddingService } from "@/shared/services/embedding.interface";
import { ILogger } from "@/shared/logger/logger.interface";
import { SubscriberEntity } from "../entities/subscriber.entity";

@injectable()
export class UpdatePreferencesUseCase {
  constructor(
    @inject("ISubscriberRepository")
    private subscriberRepository: ISubscriberRepository,
    @inject("IEmbeddingService")
    private embeddingService: IEmbeddingService,
    @inject("ILogger") private logger: ILogger
  ) {}

  async execute(
    phoneNumber: string,
    preferencesDescription: string
  ): Promise<SubscriberEntity> {
    this.logger.info(`Updating preferences for subscriber: ${phoneNumber}`);

    const subscriber = await this.subscriberRepository.findByPhone(phoneNumber);

    if (!subscriber) {
      throw new Error(`Subscriber not found: ${phoneNumber}`);
    }

    this.logger.info(
      `Generating embedding for preferences: ${preferencesDescription.substring(
        0,
        50
      )}...`
    );

    const embedding = await this.embeddingService.generateEmbedding(
      preferencesDescription
    );

    const updated = await this.subscriberRepository.update(phoneNumber, {
      preferences_description: preferencesDescription,
      preferences_embedding: embedding,
    });

    if (!updated) {
      throw new Error(`Failed to update preferences for ${phoneNumber}`);
    }

    this.logger.info(
      `Preferences updated successfully for ${phoneNumber} (${embedding.length} dimensions)`
    );

    return updated;
  }
}
