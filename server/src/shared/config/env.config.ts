import dotenv from "dotenv";
import { IConfig } from "./config.interface";

dotenv.config();

export class EnvConfig implements IConfig {
  readonly PORT: number;
  readonly NODE_ENV: string;
  readonly DATABASE_URL: string;
  readonly AI_PROVIDER?: string;
  readonly OLLAMA_BASE_URL?: string;
  readonly OLLAMA_MODEL?: string;
  readonly OLLAMA_TIMEOUT?: number;
  readonly NEWS_CRON_INTERVAL?: string;
  readonly NEWS_EMBEDDINGS_CRON_INTERVAL?: string;
  readonly WHATSAPP_CRON_INTERVAL?: string;
  readonly WHATSAPP_AI_CRON_INTERVAL?: string;
  readonly WHATSAPP_DAILY_RECIPIENTS?: string;

  constructor() {
    this.PORT = parseInt(process.env.PORT || "3000", 10);
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/zeitbot";
    this.AI_PROVIDER = process.env.AI_PROVIDER || "simple";
    this.OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
    this.OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "30000", 10);
    this.NEWS_CRON_INTERVAL = process.env.NEWS_CRON_INTERVAL || "0 */2 * * *";
    this.NEWS_EMBEDDINGS_CRON_INTERVAL = process.env.NEWS_EMBEDDINGS_CRON_INTERVAL || "*/10 * * * *";
    this.WHATSAPP_CRON_INTERVAL = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";
    this.WHATSAPP_AI_CRON_INTERVAL = process.env.WHATSAPP_AI_CRON_INTERVAL || "0 8 * * *";
    this.WHATSAPP_DAILY_RECIPIENTS = process.env.WHATSAPP_DAILY_RECIPIENTS;
  }
}

