import "reflect-metadata";
import mongoose from "mongoose";
import { injectable, inject } from "tsyringe";
import { IConfig } from "@shared/config/config.interface";
import { ILogger } from "@shared/logger/logger.interface";

@injectable()
export class DatabaseService {
  constructor(
    @inject("IConfig") private readonly config: IConfig,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async connect(): Promise<void> {
    try {
      const conn = await mongoose.connect(this.config.DATABASE_URL);
      this.logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      this.logger.error(
        `Error connecting to MongoDB: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.logger.info("MongoDB disconnected");
    } catch (error) {
      this.logger.error(
        `Error disconnecting from MongoDB: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
