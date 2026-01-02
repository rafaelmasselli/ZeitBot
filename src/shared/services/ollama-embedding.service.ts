import { injectable, inject } from "tsyringe";
import axios from "axios";
import { IEmbeddingService } from "./embedding.interface";
import { ILogger } from "../logger/logger.interface";
import { IConfig } from "@/config/env/config.interface";

interface OllamaEmbeddingResponse {
  embedding: number[];
}

@injectable()
export class OllamaEmbeddingService implements IEmbeddingService {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(
    @inject("ILogger") private logger: ILogger,
    @inject("IConfig") private config: IConfig
  ) {
    this.baseUrl = this.config.OLLAMA_BASE_URL || "http://localhost:11434";
    this.model = this.config.OLLAMA_MODEL || "llama3";
    this.timeout = this.config.OLLAMA_TIMEOUT || 30000;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.logger.info(
        `Generating embedding for text: ${text.substring(0, 50)}...`
      );

      const response = await axios.post<OllamaEmbeddingResponse>(
        `${this.baseUrl}/api/embeddings`,
        {
          model: this.model,
          prompt: text,
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.embedding || !Array.isArray(response.data.embedding)) {
        throw new Error("Invalid embedding response from Ollama");
      }

      this.logger.info(
        `Embedding generated successfully (${response.data.embedding.length} dimensions)`
      );
      return response.data.embedding;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Ollama embedding error: ${error.message}`);
        throw new Error(`Failed to generate embedding: ${error.message}`);
      }
      throw error;
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    this.logger.info(`Generating embeddings for ${texts.length} texts`);

    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    this.logger.info(`Batch embeddings generated successfully`);
    return embeddings;
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same length");
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (magnitude1 * magnitude2);

    return Math.max(-1, Math.min(1, similarity));
  }
}
