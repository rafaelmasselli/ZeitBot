import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route GET /api/health
 * @desc Verifica o status do servidor
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
  logger.debug('Health check solicitado');
  
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * @route GET /api/health/deep
 * @desc Verifica o status do servidor e suas dependências
 * @access Public
 */
router.get('/deep', async (req: Request, res: Response) => {
  logger.debug('Health check profundo solicitado');
  
  try {
    // Aqui você pode adicionar verificações de conexão com banco de dados,
    // serviços externos, etc.
    
    // Exemplo: verificar se os jobs estão funcionando
    const jobsStatus = 'ok';
    
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        jobs: jobsStatus,
        // database: dbStatus,
        // externalApi: apiStatus,
      },
    });
  } catch (error) {
    logger.error(`Erro no health check profundo: ${(error as Error).message}`);
    
    res.status(500).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});

export { router as healthRouter }; 