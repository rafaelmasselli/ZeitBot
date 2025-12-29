export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  calculateSimilarity(embedding1: number[], embedding2: number[]): number;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}
