# Architecture

ZeitBot follows Clean Architecture principles with modular, feature-based organization.

## Principles

1. **Clean Architecture** - Separation of concerns, dependency inversion
2. **SOLID** - Single responsibility, open/closed, etc.
3. **Modular** - Features in self-contained modules
4. **Testable** - Interface-based design

## Structure

```
server/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── news/            # News aggregation
│   │   └── whatsapp/        # WhatsApp bot
│   ├── shared/              # Cross-cutting
│   │   ├── services/       # Embeddings, recommendations
│   │   └── logger/         # Winston logger
│   ├── config/              # Setup
│   │   ├── database/       # MongoDB connection
│   │   └── container/      # Dependency injection
│   └── behavior/            # Integration tests
└── docs/                    # Documentation
```

## Layers

### 1. Entities (Domain)

Core business models, no dependencies.

```typescript
// NewsEntity, SubscriberEntity
export class NewsEntity {
  title: string;
  content_embedding?: number[];  // AI-generated
}
```

### 2. Use Cases (Application)

Business logic, orchestrates repositories and services.

```typescript
// SaveNewsUseCase, SendAIRecommendationsUseCase
export class SaveNewsUseCase {
  execute(news: NewsEntity): Promise<void>
}
```

### 3. Interfaces (Contracts)

Abstractions for external dependencies.

```typescript
// INewsRepository, IEmbeddingService
export interface INewsRepository {
  create(news: NewsEntity): Promise<NewsEntity>;
  findAll(): Promise<NewsEntity[]>;
}
```

### 4. Infrastructure

Implementations (MongoDB, Ollama, WhatsApp).

```typescript
// NewsRepository, OllamaEmbeddingService
export class NewsRepository implements INewsRepository {
  // MongoDB implementation
}
```

## Design Patterns

### Repository Pattern

Abstracts data access:

```typescript
interface IRepository {
  create(entity): Promise<Entity>;
  findAll(): Promise<Entity[]>;
}
```

### Command Pattern

Encapsulates WhatsApp commands:

```typescript
interface IWhatsAppCommand {
  name: string;
  execute(message: Message): Promise<void>;
}
```

### Strategy Pattern

Swappable AI providers:

```typescript
interface INewsAnalyzer {
  analyzeNews(news: NewsEntity): Promise<Result>;
}
// Implementations: OllamaAnalyzer, GeminiAnalyzer, SimpleAnalyzer
```

## Dependency Injection

Using **tsyringe** for IoC:

```typescript
// Register
container.registerSingleton<ILogger>("ILogger", WinstonLogger);

// Inject
class UseCase {
  constructor(@inject("ILogger") private logger: ILogger) {}
}
```

## Module Communication

```
WhatsApp Module → Uses → News Module
     ↓                        ↓
Repositories            Repositories
     ↓                        ↓
    MongoDB ← Shared ← Embeddings Service
```

## Data Flow

### News Ingestion

```
Provider → GetNewsUseCase → SaveNewsUseCase → MongoDB
                                                 ↓
                                        GenerateEmbeddings
                                                 ↓
                                        MongoDB (with vectors)
```

### Recommendations

```
User Preferences → Generate Embedding → MongoDB
                                          ↓
                                    Cron Job (8 AM)
                                          ↓
                                Calculate Similarity
                                          ↓
                                   WhatsApp Delivery
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Database | MongoDB + Typegoose |
| WhatsApp | whatsapp-web.js |
| AI | Ollama (LLama3) |
| DI | tsyringe |
| Jobs | node-cron |
| Tests | Jest |

## Best Practices

1. **Interfaces over concrete** - Depend on abstractions
2. **Single responsibility** - One class, one purpose
3. **Dependency injection** - Constructor injection
4. **Immutability** - Prefer readonly properties
5. **Error handling** - Try-catch with logging

## See Also

- [NEWS_MODULE.md](NEWS_MODULE.md) - News module details
- [WHATSAPP_MODULE.md](WHATSAPP_MODULE.md) - WhatsApp module details
- [AI_SYSTEM.md](AI_SYSTEM.md) - How AI works
