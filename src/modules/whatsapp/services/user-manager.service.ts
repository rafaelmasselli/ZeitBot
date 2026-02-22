import { injectable, inject } from "tsyringe";
import { Message } from "whatsapp-web.js";
import {
  UserEntity,
  UserRegistrationStep,
} from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";
import { ILogger } from "@/shared/logger/logger.interface";

@injectable()
export class UserManagerService {
  constructor(
    @inject(CachedUserRepository) private userRepo: CachedUserRepository,
    @inject("ILogger") private logger: ILogger
  ) {}

  async ensureUserExists(message: Message): Promise<UserEntity> {
    const phoneNumber = message.from.replace("@c.us", "");

    let user = await this.userRepo.findByPhone(phoneNumber);

    if (!user) {
      user = await this.createUser(phoneNumber);
      this.logger.info(`New user created: ${phoneNumber}`);
    }

    return user;
  }

  private async createUser(phoneNumber: string): Promise<UserEntity> {
    const user = new UserEntity();
    user.phone_number = phoneNumber;
    user.registration_step = UserRegistrationStep.NONE;
    user.preferred_language = "portuguese";
    user.preferred_categories = [];
    user.is_active = false;
    user.preferred_hour = 8;
    user.similarity_threshold = 0.6;

    return this.userRepo.create(user);
  }
}
