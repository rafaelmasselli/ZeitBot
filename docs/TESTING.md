# Testing Guide

How to test ZeitBot functionality.

## Test Types

### Unit Tests

Test individual components.

```bash
npm test                    # Run all
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Behavior Tests

Test real scenarios with actual dependencies.

```bash
npm run test:ollama        # News analysis with LLama3
npm run test:embeddings    # Vector generation
npm run test:ai            # Full recommendation flow
```

## Behavior Tests Explained

### 1. Ollama Test

Tests AI news analysis.

```bash
npm run test:ollama
```

**What it does**:
1. Connects to MongoDB
2. Fetches latest 3 news
3. Analyzes with LLama3
4. Shows categories, summary, keywords

**Requirements**: MongoDB running, news in database

### 2. Embeddings Test

Tests vector generation and similarity.

```bash
npm run test:embeddings
```

**What it does**:
1. Generates embeddings for sample texts
2. Calculates similarity between texts
3. Real-world matching scenario
4. Performance metrics

**Requirements**: Ollama running

### 3. AI Recommendations Test

Tests full recommendation system.

```bash
npm run test:ai
```

**What it does**:
1. Creates test subscriber with preferences
2. Fetches news with embeddings
3. Calculates similarity
4. Shows top matches with scores

**Requirements**: MongoDB running, Ollama running, news with embeddings

## Common Issues

### No News in Database

```bash
# Start app and wait for news job
npm run dev
# Wait 2 minutes

# Or manually insert
mongosh zeitbot --eval "db.news.insertOne({...})"
```

### Ollama Tests Failing

```bash
# Check Ollama is running
curl http://localhost:11434

# Start if needed
ollama serve
```

### No Embeddings

```bash
# Check count
mongosh zeitbot --eval "db.news.countDocuments({content_embedding: {\$exists: true}})"

# Wait for embeddings job (runs every 10min)
# Or restart app for immediate execution
```

## Manual Testing

### WhatsApp Commands

1. Start application
2. Scan QR code
3. Send commands:

```
!help
!subscribe
!preferences I love technology and AI
!mysubscription
!news
```

## Best Practices

1. Run tests before committing
2. Check coverage regularly
3. Test behavior tests with real data
4. Keep Ollama running during development

## See Also

- [SETUP.md](SETUP.md) - Setup testing environment
- [ARCHITECTURE.md](ARCHITECTURE.md) - Understand test structure
