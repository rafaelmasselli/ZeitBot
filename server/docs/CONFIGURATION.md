# Configuration

How to configure ZeitBot for different environments.

## Environment Variables

All configuration is in `.env` file.

### Basic

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/zeitbot

# AI Provider (simple, ollama, or gemini)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT=30000
```

### Cron Jobs

```env
# Format: minute hour day month weekday
# Examples:
#   */5 * * * *    = Every 5 minutes
#   0 */2 * * *    = Every 2 hours
#   0 8 * * *      = Every day at 8 AM

NEWS_CRON_INTERVAL=0 */2 * * *              # Fetch news
NEWS_EMBEDDINGS_CRON_INTERVAL=*/10 * * * *  # Generate embeddings
WHATSAPP_CRON_INTERVAL=0 8 * * *            # Daily messages
WHATSAPP_AI_CRON_INTERVAL=0 8 * * *         # AI recommendations
```

### WhatsApp

```env
# Optional: Default recipients
WHATSAPP_DAILY_RECIPIENTS=5511999999999,5511888888888
```

## AI Providers

### Ollama (Default)

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

**Why**: Free, private, unlimited

### Gemini

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
```

**Why**: Cloud-based, no local resources
**Note**: Paid service

### Simple

```env
AI_PROVIDER=simple
```

**Why**: No dependencies, offline
**Note**: Less accurate (keyword-based)

## Per-User Settings

Stored in MongoDB, adjustable per subscriber.

### Similarity Threshold

```javascript
// Stricter matching (fewer, higher quality news)
db.subscribers.updateOne(
  { phone_number: "5511999999999" },
  { $set: { similarity_threshold: 0.7 } }
);

// More lenient (more news, lower quality)
db.subscribers.updateOne(
  { phone_number: "5511999999999" },
  { $set: { similarity_threshold: 0.4 } }
);
```

**Recommended**: 0.5 - 0.7

### Delivery Time

```javascript
db.subscribers.updateOne(
  { phone_number: "5511999999999" },
  { $set: { preferred_hour: 10 } }  // 10 AM
);
```

## Environments

### Development

```env
NODE_ENV=development
NEWS_CRON_INTERVAL=*/5 * * * *  # Faster for testing
```

### Production

```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/zeitbot
NEWS_CRON_INTERVAL=0 */2 * * *
LOG_LEVEL=warn
```

## Database

### Local

```env
DATABASE_URL=mongodb://localhost:27017/zeitbot
```

### MongoDB Atlas

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/zeitbot
```

### With Authentication

```env
DATABASE_URL=mongodb://user:pass@localhost:27017/zeitbot?authSource=admin
```

## Performance Tuning

### Ollama

```bash
# Limit memory
OLLAMA_MAX_LOADED_MODELS=1 ollama serve

# CPU-only
OLLAMA_NUM_GPU=0 ollama serve
```

### MongoDB Indexes

```javascript
db.news.createIndex({ created_at: -1 });
db.news.createIndex({ link: 1 }, { unique: true });
db.subscribers.createIndex({ phone_number: 1 }, { unique: true });
```

## Backup

```bash
# Daily backup at 3 AM
mongodump --db zeitbot --out /backups/$(date +%Y%m%d)

# Restore
mongorestore --db zeitbot /backups/20251229/zeitbot
```

## See Also

- [SETUP.md](SETUP.md) - Initial configuration
- [AI_SYSTEM.md](AI_SYSTEM.md) - AI provider details
