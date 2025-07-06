import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../types';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Verifica se é um erro da aplicação ou um erro genérico
  const status = 'status' in err ? (err as AppError).status : 500;
  const message = err.message || 'Erro interno do servidor';

  // Registra o erro
  logger.error(`${req.method} ${req.path} - ${status} - ${message}`);
  if (status >= 500) {
    logger.error(err.stack);
  }

  // Responde com o erro
  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}; 