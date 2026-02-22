import { injectable } from "tsyringe";
import { UserEntity } from "@/shared/entities/user.entity";

@injectable()
export class UserContextService {
  private contextMap: Map<string, UserEntity> = new Map();

  setUser(phoneNumber: string, user: UserEntity): void {
    this.contextMap.set(phoneNumber, user);
  }

  getUser(phoneNumber: string): UserEntity | undefined {
    return this.contextMap.get(phoneNumber);
  }

  updateUser(phoneNumber: string, user: UserEntity): void {
    this.contextMap.set(phoneNumber, user);
  }

  clearUser(phoneNumber: string): void {
    this.contextMap.delete(phoneNumber);
  }

  hasUser(phoneNumber: string): boolean {
    return this.contextMap.has(phoneNumber);
  }
}

