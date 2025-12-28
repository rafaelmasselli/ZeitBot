import { SubscriberEntity } from "../entities/subscriber.entity";

export interface ISubscriberRepository {
  create(subscriber: SubscriberEntity): Promise<SubscriberEntity>;
  findByPhone(phoneNumber: string): Promise<SubscriberEntity | null>;
  findAllActive(): Promise<SubscriberEntity[]>;
  update(phoneNumber: string, data: Partial<SubscriberEntity>): Promise<SubscriberEntity | null>;
  deactivate(phoneNumber: string): Promise<boolean>;
}

