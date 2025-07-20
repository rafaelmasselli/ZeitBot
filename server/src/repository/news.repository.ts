import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { News } from "@/models/news";
import { INewsPlatform } from "@/types/index";
import { injectable } from "tsyringe";

export interface INewsRepository {
  create(news: News): Promise<News>;
  findLastNews(platform: INewsPlatform): Promise<News | null>;
  findOneLink(link: string): Promise<News | null>;
}

@injectable()
export class NewsRepository implements INewsRepository {
  private newsModel: ReturnModelType<typeof News>;

  constructor() {
    this.newsModel = getModelForClass(News, {
      schemaOptions: {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
      },
    });
  }

  async create(news: News): Promise<News> {
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

  findLastNews(platform: INewsPlatform): Promise<News | null> {
    return this.newsModel
      .findOne({ enterprise: platform })
      .sort({ created_at: -1 })
      .lean();
  }

  findOneLink(link: string): Promise<News | null> {
    return this.newsModel.findOne({ link }).lean();
  }
}
