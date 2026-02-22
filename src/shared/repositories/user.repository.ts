import { injectable } from "tsyringe";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findByPhone(phoneNumber: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findAllActive(): Promise<UserEntity[]>;
  update(
    phoneNumber: string,
    data: Partial<UserEntity>
  ): Promise<UserEntity | null>;
  delete(phoneNumber: string): Promise<boolean>;
}

@injectable()
export class UserRepository implements IUserRepository {
  private userModel: ReturnModelType<typeof UserEntity>;

  constructor() {
    this.userModel = getModelForClass(UserEntity);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const result = await this.userModel.create(user);
    return result;
  }

  async findByPhone(phoneNumber: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ phone_number: phoneNumber }).lean();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userModel.findById(id).lean();
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userModel.find().lean();
  }

  async findAllActive(): Promise<UserEntity[]> {
    return this.userModel.find({ is_active: true }).lean();
  }

  async update(
    phoneNumber: string,
    data: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    return this.userModel
      .findOneAndUpdate(
        { phone_number: phoneNumber },
        { $set: data },
        { new: true }
      )
      .lean();
  }

  async delete(phoneNumber: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({
      phone_number: phoneNumber,
    });
    return result.deletedCount > 0;
  }
}
