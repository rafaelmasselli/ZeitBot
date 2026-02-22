export interface IConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  AI_PROVIDER?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  OLLAMA_TIMEOUT?: number;
  NEWS_CRON_INTERVAL?: string;
  NEWS_EMBEDDINGS_CRON_INTERVAL?: string;
  WHATSAPP_CRON_INTERVAL?: string;
  WHATSAPP_AI_CRON_INTERVAL?: string;
  WHATSAPP_DAILY_RECIPIENTS?: string;
}

