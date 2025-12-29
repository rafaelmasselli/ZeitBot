import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { NewsEntity, NewsPlatform } from "../entities/news.entity";
import { INewsRepository } from "../interfaces/news.repository.interface";
import { injectable } from "tsyringe";

@injectable()
export class NewsRepository implements INewsRepository {
  private newsModel: ReturnModelType<typeof NewsEntity>;

  constructor() {
    this.newsModel = getModelForClass(NewsEntity, {
      schemaOptions: {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
      },
    });
  }

  async create(news: NewsEntity): Promise<NewsEntity> {
    try {
      const result = await this.newsModel.findOneAndUpdate(
        { $or: [{ title: news.title }, { link: news.link }] },
        { $set: news },
        { new: true, upsert: true, runValidators: true }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findLastNews(platform: NewsPlatform): Promise<NewsEntity | null> {
    return this.newsModel
      .findOne({ enterprise: platform })
      .sort({ created_at: -1 })
      .lean();
  }

  async findOneByLink(link: string): Promise<NewsEntity | null> {
    return this.newsModel.findOne({ link }).lean();
  }

  async findAll(): Promise<NewsEntity[]> {
    return this.newsModel.find().sort({ created_at: -1 }).lean();
  }
}

