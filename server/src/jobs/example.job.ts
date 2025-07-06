import { logger } from '../utils/logger';

export const exampleJob = async (): Promise<void> => {
  try {
    logger.info('Starting example job');
    
    await simulateApiCall();
    
    const processedData = await processData();
    
    logger.info(`Example job completed: ${processedData.length} records processed`);
  } catch (error) {
    logger.error(`Error in example job: ${(error as Error).message}`);
    throw error;
  }
};

const simulateApiCall = async (): Promise<any[]> => {
  logger.debug('Fetching data from external API...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockData = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 100,
    timestamp: new Date().toISOString(),
  }));
  
  logger.debug(`Data received from API: ${mockData.length} records`);
  return mockData;
};

const processData = async (): Promise<any[]> => {
  logger.debug('Processing data...');
  
  const data = await simulateApiCall();
  
  const processedData = data.map(item => ({
    ...item,
    processed: true,
    processedValue: item.value * 1.5,
    processedAt: new Date().toISOString(),
  }));
  
  logger.debug(`Data processed: ${processedData.length} records`);
  return processedData;
};
