import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { UserEntity } from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";

@injectable()
export class GetSubscriberUseCase {
  constructor(
    @inject(CachedUserRepository) private userRepository: CachedUserRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(phoneNumber: string): Promise<UserEntity | null> {
    try {
      this.logger.info(`Getting user info: ${phoneNumber}`);

      const user = await this.userRepository.findByPhone(phoneNumber);

      if (!user) {
        this.logger.info(`User not found: ${phoneNumber}`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error getting user ${phoneNumber}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
