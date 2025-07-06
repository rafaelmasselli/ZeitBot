export interface Config {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface JobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
}

export interface ApiServiceOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
