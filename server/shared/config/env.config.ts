import dotenv from "dotenv";
import { IConfig } from "./config.interface";

dotenv.config();

export class EnvConfig implements IConfig {
  readonly PORT: number;
  readonly NODE_ENV: string;
  readonly DATABASE_URL: string;

  constructor() {
    this.PORT = parseInt(process.env.PORT || "3000", 10);
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/zeitbot";
  }
}

