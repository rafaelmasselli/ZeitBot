# Logging System

## Overview

ZeitBot uses Winston for comprehensive structured logging with session tracking, context, and both console and file outputs.

## Log Files

All logs are stored in the `logs/` directory (automatically created on first run):

- **`logs/combined.log`** - All application logs (info, warn, error, debug)
- **`logs/error.log`** - Error logs only

## Configuration

### Log Rotation

- **Max file size:** 5MB per file
- **Max files:** 5 backup files per log type
- **Format:** Structured JSON with timestamps and metadata

### Log Levels

- `error` - Errors and exceptions
- `warn` - Warning messages
- `info` - General information (default level)
- `debug` - Detailed debug information

Set log level via environment variable:

```bash
LOG_LEVEL=debug  # or info, warn, error
```

## Structured Logging

### Log Context

Every log entry can include contextual metadata for better tracking:

```typescript
export interface LogContext {
  sessionId?: string; // Session/request ID
  userId?: string; // User identifier
  phoneNumber?: string; // WhatsApp phone number
  module?: string; // Module name (news, whatsapp, ai)
  component?: string; // Component/Service name
  action?: string; // Action being performed
  requestId?: string; // API request ID
  newsId?: string; // News article ID
  subscriberId?: string; // Subscriber ID
  [key: string]: any; // Any custom fields
}
```

### Automatic Metadata

Every log automatically includes:

- `logId` - Unique UUID for the log entry
- `timestamp` - ISO timestamp
- `level` - Log level
- `message` - Log message
- `pid` - Process ID
- `hostname` - Server hostname
- Any custom context provided

## Usage Examples

### Basic Logging (Backward Compatible)

```typescript
import { ILogger } from "@/shared/logger/logger.interface";

constructor(
  @inject("ILogger") private logger: ILogger
) {}

// Simple messages
this.logger.info("Operation completed");
this.logger.warn("Deprecated feature");
this.logger.error("Connection failed");
```

### Logging with Context

```typescript
// User action tracking
this.logger.info("User sent command", {
  phoneNumber: subscriber.phone_number,
  module: "whatsapp",
  component: "CommandHandler",
  action: "processCommand",
  command: "news",
});

// Error tracking with context
this.logger.error("Failed to generate embedding", {
  newsId: news.id,
  module: "news",
  component: "OllamaEmbeddingService",
  action: "generateEmbedding",
  error: error.message,
});

// AI recommendation tracking
this.logger.info("Recommendations sent", {
  subscriberId: subscriber.id,
  sessionId: "abc-123",
  module: "ai",
  component: "SendAIRecommendationsUseCase",
  action: "execute",
  recommendationsCount: 5,
  topScore: 0.92,
});
```

### Using Default Context

Set default context for a service to avoid repeating the same fields:

```typescript
export class MyService {
  constructor(@inject("ILogger") private logger: ILogger) {
    // Set context once for all logs from this service
    this.logger.setDefaultContext({
      module: "news",
      component: "MyService",
    });
  }

  processData(newsId: string) {
    // Only need to add specific context
    this.logger.info("Processing started", {
      newsId,
      action: "processData",
    });

    // Logs will include: module, component, newsId, action
  }

  cleanup() {
    this.logger.clearDefaultContext();
  }
}
```

## Git Ignore

The `logs/` directory is automatically ignored by Git (configured in `.gitignore`):

```
# Logs
logs/
*.log
```

This ensures log files are never committed to the repository.

## Log Format Examples

### Console Output

```
2025-12-30 14:30:15 [info]: User sent command {"phoneNumber":"5511999999999","module":"whatsapp","component":"CommandHandler","action":"processCommand","logId":"abc-123-def","pid":12345,"hostname":"server-01"}
```

### File Output (JSON)

```json
{
  "timestamp": "2025-12-30 14:30:15",
  "level": "info",
  "message": "User sent command",
  "phoneNumber": "5511999999999",
  "module": "whatsapp",
  "component": "CommandHandler",
  "action": "processCommand",
  "logId": "abc-123-def-456",
  "pid": 12345,
  "hostname": "server-01"
}
```

## Monitoring Logs

### View Real-time Logs

```bash
# All logs (pretty printed)
tail -f logs/combined.log | jq '.'

# Errors only
tail -f logs/error.log | jq '.'

# Filter by module
tail -f logs/combined.log | jq 'select(.module == "whatsapp")'

# Filter by user
tail -f logs/combined.log | jq 'select(.phoneNumber == "5511999999999")'
```

### Search Logs by Context

```bash
# Find all logs for a specific user
jq 'select(.phoneNumber == "5511999999999")' logs/combined.log

# Find all logs from a specific module
jq 'select(.module == "news")' logs/combined.log

# Find all logs for a specific session
jq 'select(.sessionId == "abc-123")' logs/combined.log

# Find errors in a specific component
jq 'select(.level == "error" and .component == "OllamaNewsAnalyzer")' logs/error.log

# Find AI recommendation logs
jq 'select(.module == "ai" and .action == "execute")' logs/combined.log

# Count logs by module
jq -r '.module' logs/combined.log | sort | uniq -c

# Find slow operations (custom metric)
jq 'select(.duration != null) | select(.duration | tonumber > 1000)' logs/combined.log
```

### Advanced Log Analysis

```bash
# Top 10 most active users
jq -r '.phoneNumber' logs/combined.log | grep -v null | sort | uniq -c | sort -rn | head -10

# Error rate by component
jq 'select(.level == "error")' logs/error.log | jq -r '.component' | sort | uniq -c

# Find all logs in a time range
jq 'select(.timestamp >= "2025-12-30 14:00:00" and .timestamp <= "2025-12-30 15:00:00")' logs/combined.log

# Track a specific session flow
SESSION_ID="abc-123"
jq --arg sid "$SESSION_ID" 'select(.sessionId == $sid)' logs/combined.log | jq -r '[.timestamp, .component, .action, .message] | @tsv'

# Find logs with specific error
grep "Connection timeout" logs/error.log | jq '.'
```

## Clean Up Logs

```bash
# Remove all log files
rm -rf logs/*.log

# Keep only recent logs (last 7 days)
find logs/ -name "*.log" -mtime +7 -delete
```

## Best Practices

### 1. Use Structured Context

**✅ Good:**
```typescript
this.logger.info("Recommendations sent", {
  subscriberId: subscriber.id,
  phoneNumber: subscriber.phone_number,
  module: "ai",
  component: "SendAIRecommendationsUseCase",
  action: "sendRecommendations",
  count: recommendations.length,
  topScore: recommendations[0]?.score,
});
```

**❌ Bad:**
```typescript
this.logger.info(`Sent ${count} recommendations to ${phoneNumber}`);
// Hard to search, parse, and analyze
```

### 2. Include Session/Request Tracking

**✅ Good:**
```typescript
const sessionId = randomUUID();

this.logger.info("Processing started", { sessionId, action: "start" });
// ... multiple operations ...
this.logger.info("Processing completed", { sessionId, action: "complete" });
// Easy to track entire flow
```

**❌ Bad:**
```typescript
this.logger.info("Processing started");
// ... operations ...
this.logger.info("Processing completed");
// No way to correlate logs
```

### 3. Use Appropriate Log Levels

- **`error`** - Something failed, needs attention
- **`warn`** - Something unexpected, but handled
- **`info`** - Normal business events
- **`debug`** - Detailed technical information

### 4. Never Log Sensitive Data

**❌ Never log:**
- Passwords
- API tokens
- Credit card numbers
- Full user documents
- Authentication tokens

**✅ Safe to log:**
- User IDs (anonymized if needed)
- Phone numbers (last 4 digits only if required)
- Session IDs
- Request IDs
- Timestamps

### 5. Use Default Context for Services

```typescript
export class MyService {
  constructor(@inject("ILogger") private logger: ILogger) {
    this.logger.setDefaultContext({
      module: "news",
      component: "MyService",
    });
  }
  
  // All logs automatically include module and component
}
```

### 6. Log Operation Results

```typescript
// Log start
this.logger.info("Generating embeddings", {
  newsId,
  module: "ai",
  action: "generateEmbeddings",
});

// Log completion with metrics
this.logger.info("Embeddings generated", {
  newsId,
  module: "ai",
  action: "generateEmbeddings",
  dimensions: 4096,
  duration: "2.3s",
  status: "success",
});
```

### 7. Track User Actions

```typescript
this.logger.info("User command received", {
  phoneNumber: subscriber.phone_number,
  subscriberId: subscriber.id,
  module: "whatsapp",
  action: "processCommand",
  command: "preferences",
});
```

## Real-World Examples

### Tracking a Complete User Flow

```typescript
// 1. User sends WhatsApp message
this.logger.info("Command received", {
  phoneNumber: "5511999999999",
  sessionId: "abc-123",
  module: "whatsapp",
  component: "CommandHandler",
  action: "receive",
  command: "news",
});

// 2. Fetch news
this.logger.info("Fetching news", {
  sessionId: "abc-123",
  module: "news",
  component: "GetNewsUseCase",
  action: "execute",
});

// 3. Generate recommendations
this.logger.info("Generating recommendations", {
  subscriberId: "sub-456",
  sessionId: "abc-123",
  module: "ai",
  component: "NewsRecommendationService",
  action: "recommend",
});

// 4. Send response
this.logger.info("Message sent", {
  phoneNumber: "5511999999999",
  sessionId: "abc-123",
  module: "whatsapp",
  component: "WhatsAppService",
  action: "sendMessage",
  messageLength: 450,
});
```

Now you can track the entire flow: `jq 'select(.sessionId == "abc-123")' logs/combined.log`

### Tracking Job Execution

```typescript
const executionId = randomUUID();

this.logger.info("Job started", {
  executionId,
  jobName: "NewsEmbeddingsJob",
  module: "jobs",
  action: "start",
});

this.logger.info("News fetched", {
  executionId,
  jobName: "NewsEmbeddingsJob",
  module: "jobs",
  action: "fetchNews",
  count: 25,
});

this.logger.info("Embeddings generated", {
  executionId,
  jobName: "NewsEmbeddingsJob",
  module: "jobs",
  action: "generateEmbeddings",
  processed: 25,
  failed: 0,
});

this.logger.info("Job completed", {
  executionId,
  jobName: "NewsEmbeddingsJob",
  module: "jobs",
  action: "complete",
  duration: "45s",
  status: "success",
});
```
