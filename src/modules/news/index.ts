// Entities
export * from "./entities/news.entity";

// Interfaces
export * from "./interfaces/news.repository.interface";
export * from "./interfaces/news-provider.interface";
export * from "./interfaces/news-analyzer.interface";

// Use Cases
export * from "./use-cases/get-news.use-case";
export * from "./use-cases/save-news.use-case";
export * from "./use-cases/generate-news-embeddings.use-case";

// Repositories
export * from "./repositories/news.repository";

// Providers
export * from "./providers/bbc/bbc.provider";
export * from "./providers/brazil-indeed/brazil-indeed.provider";

// Services
export * from "./services/gemini-news-analyzer.service";
export * from "./services/simple-news-analyzer.service";
export * from "./services/ollama-news-analyzer.service";

// Routes
export * from "./routes/news.routes";

// Jobs
export * from "./jobs";
