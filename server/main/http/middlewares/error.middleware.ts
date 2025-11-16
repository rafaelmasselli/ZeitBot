import { Request, Response, NextFunction } from "express";
import { ILogger } from "@shared/logger/logger.interface";

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function errorHandler(logger: ILogger) {
  return (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    logger.error(`Error: ${error.message}`);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  };
}

