# WhatsApp Module

Handles WhatsApp bot integration, commands, user management, and personalized delivery.

## Purpose

This module connects ZeitBot to WhatsApp, processes user commands, manages subscriptions, and delivers personalized news recommendations.

## Structure

```
whatsapp/
├── entities/         # Data models (SubscriberEntity)
├── commands/         # Bot commands (!help, !subscribe, etc.)
├── use-cases/        # Business logic
├── repositories/     # Database operations
├── services/         # WhatsApp client wrapper
└── *.job.ts         # Automated tasks
```

## Key Concepts

### Subscriber

A user who receives news via WhatsApp.

**Properties**:
- `phone_number` - WhatsApp ID
- `preferences_description` - Natural language ("I love tech")
- `preferences_embedding` - 4096D vector for matching
- `similarity_threshold` - Min match score (default: 0.6)
- `is_active` - Subscription status

### Commands

WhatsApp bot commands starting with `!`:

| Command | Purpose |
|---------|---------|
| `!help` | List commands |
| `!news` | Get latest news |
| `!subscribe` | Start daily delivery |
| `!unsubscribe` | Stop delivery |
| `!preferences <text>` | Set interests for AI |
| `!mysubscription` | View settings |

### Jobs

Automated tasks:

- **Daily Messages** (8 AM) - Generic news to all
- **AI Recommendations** (8 AM) - Personalized by similarity

## How It Works

### 1. User Subscription

```
User: !subscribe
Bot: Creates subscriber → is_active=true
Bot: "Subscribed! Set preferences with !preferences"
```

### 2. Setting Preferences

```
User: !preferences I love technology and AI
Bot: Generates 4096D embedding with LLama3
Bot: Saves to MongoDB
Bot: "Preferences updated! You'll receive personalized news"
```

### 3. AI Recommendations (Cron Job)

```
Every day at 8 AM:
1. Fetch active subscribers with embeddings
2. Fetch news with embeddings
3. For each subscriber:
   - Calculate similarity (cosine)
   - Filter by threshold (e.g. >= 0.6)
   - Sort by score
   - Send top 5 via WhatsApp
```

## Configuration

### Environment

```env
WHATSAPP_CRON_INTERVAL=0 8 * * *      # Daily messages
WHATSAPP_AI_CRON_INTERVAL=0 8 * * *   # AI recommendations
```

### Per-User Settings

```javascript
// Adjust match threshold
db.subscribers.updateOne(
  { phone_number: "5511999999999" },
  { $set: { similarity_threshold: 0.5 } }  // More lenient
);

// Change delivery time
db.subscribers.updateOne(
  { phone_number: "5511999999999" },
  { $set: { preferred_hour: 10 } }  // 10 AM
);
```

## Message Flow

```
User sends "!preferences I love tech"
    ↓
WhatsAppService receives message
    ↓
CommandHandler routes to PreferencesCommand
    ↓
UpdatePreferencesUseCase:
  - Calls OllamaEmbeddingService
  - Generates 4096D vector
  - Saves to MongoDB
    ↓
Bot replies: "Preferences updated!"
```

## Common Issues

### No Recommendations

**Cause**: Missing embeddings or high threshold

**Fix**:
```bash
# Check embeddings exist
db.subscribers.findOne({ phone_number: "..." })
db.news.countDocuments({ content_embedding: { $exists: true } })

# Lower threshold
db.subscribers.updateOne(
  { phone_number: "..." },
  { $set: { similarity_threshold: 0.4 } }
)
```

### QR Code Not Showing

**Fix**: Delete `.wwebjs_auth/` folder and restart

## Testing

```bash
# Manual: Send commands via WhatsApp
!help
!subscribe
!preferences I love technology

# Automated
npm run test:ai
```

## See Also

- [AI_SYSTEM.md](AI_SYSTEM.md) - How embeddings work
- [CONFIGURATION.md](CONFIGURATION.md) - Advanced settings
