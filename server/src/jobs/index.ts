import cron from 'node-cron';
import { logger } from '../utils/logger';
import { JobConfig } from '../types';

// Exemplo de job
import { exampleJob } from './example.job';

// Lista de jobs configurados
const jobs: JobConfig[] = [
  {
    name: 'exampleJob',
    schedule: '*/30 * * * *', // A cada 30 minutos
    enabled: true,
  },
  // Adicione mais jobs conforme necessário
];

/**
 * Inicializa todos os jobs cron habilitados
 */
export const initCronJobs = (): void => {
  logger.info('Inicializando jobs cron...');

  jobs.forEach((job) => {
    if (!job.enabled) {
      logger.info(`Job ${job.name} está desabilitado`);
      return;
    }

    try {
      if (!cron.validate(job.schedule)) {
        throw new Error(`Expressão cron inválida: ${job.schedule}`);
      }

      // Registra o job com o schedule especificado
      cron.schedule(job.schedule, async () => {
        logger.info(`Executando job: ${job.name}`);
        
        try {
          // Executa o job correspondente
          switch (job.name) {
            case 'exampleJob':
              await exampleJob();
              break;
            // Adicione mais casos conforme necessário
            default:
              logger.warn(`Job desconhecido: ${job.name}`);
          }
          
          logger.info(`Job ${job.name} concluído com sucesso`);
        } catch (error) {
          logger.error(`Erro ao executar job ${job.name}: ${(error as Error).message}`);
        }
      });
      
      logger.info(`Job ${job.name} agendado com sucesso: ${job.schedule}`);
    } catch (error) {
      logger.error(`Erro ao agendar job ${job.name}: ${(error as Error).message}`);
    }
  });
}; 