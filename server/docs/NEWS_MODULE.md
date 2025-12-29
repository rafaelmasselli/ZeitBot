# News Module

Handles news aggregation, AI analysis, and embedding generation.

## Purpose

This module fetches news from multiple sources, analyzes them with AI, generates semantic embeddings, and stores everything in MongoDB.

## Structure

```
news/
├── entities/         # NewsEntity, NewsPlatform
├── providers/        # BBC, Brasil de Fato scrapers
├── services/         # AI analyzers (Ollama, Gemini, Simple)
├── use-cases/        # Get, save, generate embeddings
├── repositories/     # MongoDB operations
└── *.job.ts         # Automated tasks
```

## Key Concepts

### News Entity

A news article with AI-generated data.

**Core Fields**:
- `title`, `description`, `link` - Article content
- `enterprise` - Source (BBC, BRAZIL_INDEED)
- `content_embedding` - 4096D vector for matching

### Providers

Fetch news from external sources:

- **BBCNewsProvider** - BBC Portuguese RSS
- **BrazilIndeedProvider** - Brasil de Fato RSS

### AI Analyzers

Analyze and categorize news:

| Provider | Type | Cost | Features |
|----------|------|------|----------|
| **Ollama** | Local AI | Free | Semantic, embeddings |
| **Gemini** | Cloud API | Paid | Fast, semantic |
| **Simple** | Keywords | Free | Basic, offline |

### Jobs

Automated tasks:

- **News Fetching** (every 2h) - Scrape and save
- **Embeddings Generation** (every 10min) - Generate vectors

## How It Works

### 1. News Fetching

```
Cron triggers every 2h
    ↓
GetNewsUseCase:
  - Calls all providers (BBC, Brasil de Fato)
  - Fetches new articles
    ↓
SaveNewsUseCase:
  - Validates and deduplicates
  - Saves to MongoDB
```

### 2. Embeddings Generation

```
Cron triggers every 10min
    ↓
GenerateNewsEmbeddingsUseCase:
  - Finds news without embeddings
  - For each news:
    - Combines title + description
    - Sends to LLama3
    - Gets 4096D vector
    - Updates MongoDB
```

### 3. Data Flow

```
RSS Feed → Provider → Use Case → MongoDB
                                    ↓
                              (with embedding)
                                    ↓
                          Available for matching
```

## Configuration

### Environment

```env
AI_PROVIDER=ollama                      # ollama, gemini, or simple
OLLAMA_BASE_URL=http://localhost:11434
NEWS_CRON_INTERVAL=0 */2 * * *          # Every 2 hours
NEWS_EMBEDDINGS_CRON_INTERVAL=*/10 * * * *  # Every 10 minutes
```

### Adding News Source

1. Create provider implementing `INewsProvider`
2. Register in DI container
3. Restart application

## Database Schema

```javascript
{
  title: "News title",
  description: "News description",
  link: "https://...",
  enterprise: "BBC",
  
  // AI-generated
  content_embedding: [/* 4096 numbers */],  // For matching
  
  date: ISODate("2025-12-29T10:00:00.000Z"),
  created_at: ISODate("..."),
  updated_at: ISODate("...")
}
```

## Common Issues

### Embeddings Not Generating

**Cause**: Ollama not running

**Fix**:
```bash
# Check Ollama
curl http://localhost:11434

# Start Ollama
ollama serve
```

### Duplicate News

**Solution**: Repository automatically deduplicates by title/link

## Testing

```bash
npm run test:ollama     # Test AI analysis
npm run test:embeddings # Test vector generation
```

## See Also

- [AI_SYSTEM.md](AI_SYSTEM.md) - Embeddings explained
- [SETUP.md](SETUP.md) - Install Ollama
