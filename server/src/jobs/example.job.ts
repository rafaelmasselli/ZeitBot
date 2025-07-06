import { logger } from '../utils/logger';

/**
 * Job de exemplo que pode ser usado como modelo para outros jobs
 * Este job simula o processamento de dados de uma API externa
 */
export const exampleJob = async (): Promise<void> => {
  try {
    logger.info('Iniciando job de exemplo');
    
    // Simulação de processamento assíncrono
    await simulateApiCall();
    
    // Simulação de processamento de dados
    const processedData = await processData();
    
    logger.info(`Job de exemplo concluído: ${processedData.length} registros processados`);
  } catch (error) {
    logger.error(`Erro no job de exemplo: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Simula uma chamada de API externa
 */
const simulateApiCall = async (): Promise<any[]> => {
  logger.debug('Buscando dados da API externa...');
  
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simula dados retornados pela API
  const mockData = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 100,
    timestamp: new Date().toISOString(),
  }));
  
  logger.debug(`Dados recebidos da API: ${mockData.length} registros`);
  return mockData;
};

/**
 * Simula processamento de dados
 */
const processData = async (): Promise<any[]> => {
  logger.debug('Processando dados...');
  
  // Busca dados simulados
  const data = await simulateApiCall();
  
  // Simula processamento
  const processedData = data.map(item => ({
    ...item,
    processed: true,
    processedValue: item.value * 1.5,
    processedAt: new Date().toISOString(),
  }));
  
  logger.debug(`Dados processados: ${processedData.length} registros`);
  return processedData;
}; 