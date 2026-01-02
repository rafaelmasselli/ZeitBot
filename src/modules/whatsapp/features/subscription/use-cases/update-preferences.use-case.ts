import { injectable, inject } from "tsyringe";
import { UserEntity } from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";
import { IEmbeddingService } from "@/shared/services/embedding.interface";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class UpdatePreferencesUseCase {
  constructor(
    @inject(CachedUserRepository) private userRepository: CachedUserRepository,
    @inject("IEmbeddingService")
    private embeddingService: IEmbeddingService,
    @inject("ILogger") private logger: ILogger
  ) {}

  async execute(
    phoneNumber: string,
    preferencesDescription: string
  ): Promise<UserEntity> {
    this.logger.info(`Updating preferences for user: ${phoneNumber}`);

    const user = await this.userRepository.findByPhone(phoneNumber);

    if (!user) {
      throw new Error(`User not found: ${phoneNumber}`);
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

    const updated = await this.userRepository.update(phoneNumber, {
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
