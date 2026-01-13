import { injectable, inject } from "tsyringe";
import { ILogger } from "@/shared/logger/logger.interface";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";

@injectable()
export class UnsubscribeUserUseCase {
  constructor(
    @inject(CachedUserRepository) private userRepository: CachedUserRepository,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async execute(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.info(`Unsubscribing user: ${phoneNumber}`);

      const user = await this.userRepository.findByPhone(phoneNumber);

      if (!user) {
        this.logger.warn(`User not found: ${phoneNumber}`);
        return false;
      }

      const updated = await this.userRepository.update(phoneNumber, {
        is_active: false,
      });

      if (updated) {
        this.logger.info(`User unsubscribed: ${phoneNumber}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error unsubscribing user ${phoneNumber}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
