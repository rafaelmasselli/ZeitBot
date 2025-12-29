import { injectable } from "tsyringe";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { SubscriberEntity } from "../entities/subscriber.entity";
import { ISubscriberRepository } from "../interfaces/subscriber.repository.interface";

@injectable()
export class SubscriberRepository implements ISubscriberRepository {
  private subscriberModel: ReturnModelType<typeof SubscriberEntity>;

  constructor() {
    this.subscriberModel = getModelForClass(SubscriberEntity);
  }

  async create(subscriber: SubscriberEntity): Promise<SubscriberEntity> {
    const result = await this.subscriberModel.create(subscriber);
    return result;
  }

  async findByPhone(phoneNumber: string): Promise<SubscriberEntity | null> {
    return this.subscriberModel.findOne({ phone_number: phoneNumber }).lean();
  }

  async findAll(): Promise<SubscriberEntity[]> {
    return this.subscriberModel.find().lean();
  }

  async findAllActive(): Promise<SubscriberEntity[]> {
    return this.subscriberModel.find({ is_active: true }).lean();
  }

  async update(
    phoneNumber: string,
    data: Partial<SubscriberEntity>
  ): Promise<SubscriberEntity | null> {
    return this.subscriberModel
      .findOneAndUpdate(
        { phone_number: phoneNumber },
        { $set: data },
        { new: true }
      )
      .lean();
  }

  async deactivate(phoneNumber: string): Promise<boolean> {
    const result = await this.subscriberModel.updateOne(
      { phone_number: phoneNumber },
      { $set: { is_active: false } }
    );
    return result.modifiedCount > 0;
  }
}

