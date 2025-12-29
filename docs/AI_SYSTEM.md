# AI & Embeddings System

How ZeitBot uses neural networks to understand and match news with user preferences.

## What Are Embeddings?

Embeddings are dense vector representations of text in high-dimensional space.

```
"I love technology and AI"
    ↓ (LLama3 processes)
[-1.192, -0.408, 2.689, ..., 0.234]
(4096 numbers)
```

**Why?** Similar texts produce similar vectors, enabling semantic matching.

## How Matching Works

### 1. Generate Vectors

```
User preference: "technology and AI"  → [0.234, -0.567, ...]
News: "OpenAI launches GPT-5"         → [0.198, -0.523, ...]
```

### 2. Calculate Similarity

Uses **cosine similarity** (angle between vectors):

```
similarity = (A · B) / (||A|| × ||B||)
Result: 0.0 to 1.0 (0% to 100%)
```

### 3. Filter & Rank

```
News 1: 92% match → ✅ SEND
News 2: 78% match → ✅ SEND  
News 3: 45% match → ❌ SKIP (below 60% threshold)
```

## Architecture

```
User Preferences → LLama3 → 4096D Vector → MongoDB
                                              ↓
                                      [0.234, -0.567, ...]

News Articles → LLama3 → 4096D Vector → MongoDB
                                          ↓
                                  [0.198, -0.523, ...]

Cron Job (8 AM) → Calculate Similarity → Send Top Matches
```

## AI Providers

### Ollama (Recommended)

**Why**: Free, private, unlimited

**Setup**:
```bash
ollama pull llama3
ollama serve
```

**Config**:
```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3
```

### Gemini (Alternative)

**Why**: Cloud-based, no local resources

**Config**:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
```

**Note**: Paid service

### Simple (Fallback)

**Why**: No dependencies, instant

**Config**:
```env
AI_PROVIDER=simple
```

**Note**: Keyword-based, less accurate

## Performance

| Operation | Time | Memory |
|-----------|------|--------|
| Generate embedding | ~2-5s (first) | 16 KB |
| Generate embedding | ~90ms (cached) | 16 KB |
| Calculate similarity | <1ms | - |
| Process 100 news | ~4ms | - |

## Configuration

### Similarity Threshold

Controls match strictness:

```javascript
// Strict (only highly relevant)
{ similarity_threshold: 0.7 }  // 70%

// Balanced (recommended)
{ similarity_threshold: 0.6 }  // 60%

// Lenient (more variety)
{ similarity_threshold: 0.4 }  // 40%
```

### Environment

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=30000
NEWS_EMBEDDINGS_CRON_INTERVAL=*/10 * * * *
```

## Troubleshooting

### Ollama Not Responding

```bash
curl http://localhost:11434
# Should return: "Ollama is running"

# If not:
ollama serve
```

### No Recommendations

```bash
# Check embeddings exist
db.subscribers.findOne({ preferences_embedding: { $exists: true } })
db.news.countDocuments({ content_embedding: { $exists: true } })

# Lower threshold
db.subscribers.updateOne(
  { phone_number: "..." },
  { $set: { similarity_threshold: 0.4 } }
)
```

## Testing

```bash
npm run test:embeddings    # Test vector generation
npm run test:ai            # Test full recommendation system
```

## See Also

- [NEWS_MODULE.md](NEWS_MODULE.md) - How embeddings are generated
- [WHATSAPP_MODULE.md](WHATSAPP_MODULE.md) - How recommendations are delivered
