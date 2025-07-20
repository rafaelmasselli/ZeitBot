import "reflect-metadata";
import mongoose from "mongoose";
import { injectable, inject } from "tsyringe";
import { Config } from "../types";
import { ILogger } from "../utils";

@injectable()
export class DatabaseService {
  constructor(
    @inject("Config") private readonly config: Config,
    @inject("ILogger") private readonly logger: ILogger
  ) {}

  async connect(): Promise<void> {
    try {
      const conn = await mongoose.connect(this.config.DATABASE_URL ?? "");
      this.logger.info(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
      this.logger.error(
        `Erro ao conectar ao MongoDB: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
