export interface Config {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL?: string;
}

// Tipos para resposta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Tipos para jobs
export interface JobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
}

// Tipos para serviços de API
export interface ApiServiceOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Tipos para erros customizados
export class AppError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
