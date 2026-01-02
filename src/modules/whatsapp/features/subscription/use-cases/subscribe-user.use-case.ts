import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { UserEntity, NewsCategory } from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";

export interface SubscribeUserDTO {
  phoneNumber: string;
  name?: string;
  categories?: NewsCategory[];
  preferredHour?: number;
}

@injectable()
export class SubscribeUserUseCase {
  constructor(
    @inject(CachedUserRepository) private userRepository: CachedUserRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(data: SubscribeUserDTO): Promise<UserEntity> {
    try {
      this.logger.info(`Subscribing user: ${data.phoneNumber}`);

      const existingUser = await this.userRepository.findByPhone(
        data.phoneNumber
      );

      if (existingUser) {
        if (!existingUser.is_active) {
          const updated = await this.userRepository.update(data.phoneNumber, {
            is_active: true,
            preferred_categories:
              data.categories || existingUser.preferred_categories,
            preferred_hour: data.preferredHour || existingUser.preferred_hour,
            name: data.name || existingUser.name,
          });
          this.logger.info(`Reactivated user: ${data.phoneNumber}`);
          return updated!;
        }

        const updated = await this.userRepository.update(data.phoneNumber, {
          preferred_categories:
            data.categories || existingUser.preferred_categories,
          preferred_hour: data.preferredHour || existingUser.preferred_hour,
          name: data.name || existingUser.name,
        });
        this.logger.info(`Updated user preferences: ${data.phoneNumber}`);
        return updated!;
      }

      const user = new UserEntity();
      user.phone_number = data.phoneNumber;
      user.name = data.name;
      user.preferred_categories = data.categories || [NewsCategory.ALL];
      user.preferred_hour = data.preferredHour || 8;
      user.is_active = true;

      const created = await this.userRepository.create(user);
      this.logger.info(`New user created: ${data.phoneNumber}`);
      return created;
    } catch (error) {
      this.logger.error(
        `Error subscribing user ${data.phoneNumber}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }
}
