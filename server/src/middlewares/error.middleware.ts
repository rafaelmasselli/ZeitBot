import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../types';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = 'status' in err ? (err as AppError).status : 500;
  const message = err.message || 'Internal server error';

  logger.error(`${req.method} ${req.path} - ${status} - ${message}`);
  if (status >= 500) {
    logger.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}; 