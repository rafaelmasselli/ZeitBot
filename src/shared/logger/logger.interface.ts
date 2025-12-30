export interface LogContext {
  sessionId?: string;
  userId?: string;
  phoneNumber?: string;
  module?: string;
  component?: string;
  action?: string;
  requestId?: string;
  newsId?: string;
  subscriberId?: string;
  [key: string]: any;
}

export interface ILogger {
  info(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  setDefaultContext(context: LogContext): void;
  clearDefaultContext(): void;
}

