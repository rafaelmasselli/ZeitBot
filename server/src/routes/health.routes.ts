import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  logger.debug('Health check requested');
  
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

router.get('/deep', async (req: Request, res: Response) => {
  logger.debug('Deep health check requested');
  
  try {
    const jobsStatus = 'ok';
    
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        jobs: jobsStatus,
      },
    });
  } catch (error) {
    logger.error(`Error in deep health check: ${(error as Error).message}`);
    
    res.status(500).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});

export { router as healthRouter }; 