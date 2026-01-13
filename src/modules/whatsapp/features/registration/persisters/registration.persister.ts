import { injectable, inject } from "tsyringe";
import { UserEntity, UserRegistrationStep } from "@/shared/entities/user.entity";
import { CachedUserRepository } from "@/shared/repositories/cached-user.repository";
import { ILogger } from "@/shared/logger/logger.interface";
import {
  IRegistrationPersister,
  RegistrationData,
} from "../interfaces/registration-persister.interface";

@injectable()
export class RegistrationPersister implements IRegistrationPersister {
  constructor(
    @inject(CachedUserRepository) private userRepo: CachedUserRepository,
    @inject("ILogger") private logger: ILogger
  ) {}

  async saveCategories(
    user: UserEntity,
    data: RegistrationData
  ): Promise<void> {
    await this.userRepo.update(user.phone_number, {
      preferred_categories: data.categories,
      preferred_language: data.language,
      registration_step: UserRegistrationStep.COMPLETED,
      is_active: true,
    });

    this.logger.info(
      `User registration completed: ${user.phone_number}`,
      {
        categories: data.categories,
        language: data.language,
      }
    );
  }
}

