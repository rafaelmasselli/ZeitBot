import { Router } from 'express';
import { healthRouter } from './health.routes';

const router = Router();

// Rotas de health check
router.use('/health', healthRouter);

// Adicione outras rotas aqui
// router.use('/api/v1/resource', resourceRouter);

export default router; 