import winston from "winston";
import { ILogger, LogContext } from "./logger.interface";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;
  private defaultContext: LogContext = {};

  constructor() {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const customFormat = winston.format.printf(
      ({ level, message, timestamp, ...meta }) => {
        const logEntry: any = {
          timestamp,
          level,
          message,
          ...meta,
        };
        return JSON.stringify(logEntry);
      }
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const contextStr =
                Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
              return `${timestamp} [${level}]: ${message}${contextStr}`;
            })
          ),
        }),
        new winston.transports.File({
          filename: path.join(logsDir, "combined.log"),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, "error.log"),
          level: "error",
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });
  }

  private buildLogData(message: string, context?: LogContext) {
    const logId = randomUUID();
    return {
      message,
      logId,
      ...this.defaultContext,
      ...context,
      pid: process.pid,
      hostname: require("os").hostname(),
    };
  }

  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  clearDefaultContext(): void {
    this.defaultContext = {};
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.buildLogData(message, context));
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.buildLogData(message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.buildLogData(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.buildLogData(message, context));
  }
}
