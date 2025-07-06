import winston from "winston";
import config from "../config";

const { combine, timestamp, printf, colorize } = winston.format;

// Formato personalizado para logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Configuração do logger
export const logger = winston.createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // Log no console
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
    // Log em arquivo (apenas em produção)
    ...(config.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : []),
  ],
});
