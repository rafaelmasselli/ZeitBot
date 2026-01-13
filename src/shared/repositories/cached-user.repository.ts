import { injectable, inject } from "tsyringe";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "./user.repository";
import { UserContextService } from "@/modules/whatsapp/services/user-context.service";

@injectable()
export class CachedUserRepository {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(UserContextService) private userContext: UserContextService
  ) {}

  async findByPhone(phoneNumber: string): Promise<UserEntity | null> {
    const cachedUser = this.userContext.getUser(phoneNumber);
    if (cachedUser) return cachedUser;
    const userFromDb = await this.userRepository.findByPhone(phoneNumber);
    if (userFromDb) this.userContext.setUser(phoneNumber, userFromDb);
    return userFromDb;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = await this.userRepository.create(user);
    this.userContext.setUser(createdUser.phone_number, createdUser);
    return createdUser;
  }

  async update(
    phoneNumber: string,
    data: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    const updatedUser = await this.userRepository.update(phoneNumber, data);
    if (updatedUser) this.userContext.updateUser(phoneNumber, updatedUser);
    return updatedUser;
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async findAllActive(): Promise<UserEntity[]> {
    return this.userRepository.findAllActive();
  }

  clearCache(phoneNumber: string): void {
    this.userContext.clearUser(phoneNumber);
  }
}
