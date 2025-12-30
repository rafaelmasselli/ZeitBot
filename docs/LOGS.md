# Logging System

## Overview

ZeitBot uses Winston for comprehensive logging with both console and file outputs.

## Log Files

All logs are stored in the `logs/` directory (automatically created on first run):

- **`logs/combined.log`** - All application logs (info, warn, error, debug)
- **`logs/error.log`** - Error logs only

## Configuration

### Log Rotation

- **Max file size:** 5MB per file
- **Max files:** 5 backup files per log type
- **Format:** JSON with timestamps

### Log Levels

- `error` - Errors and exceptions
- `warn` - Warning messages
- `info` - General information (default level)
- `debug` - Detailed debug information

## Usage

```typescript
import { ILogger } from "@/shared/logger/logger.interface";

constructor(
  @inject("ILogger") private logger: ILogger
) {}

// Log messages
this.logger.info("Operation completed successfully");
this.logger.warn("Deprecated feature used");
this.logger.error("Failed to process request");
this.logger.debug("Variable value: " + value);
```

## Git Ignore

The `logs/` directory is automatically ignored by Git (configured in `.gitignore`):

```
# Logs
logs/
*.log
```

This ensures log files are never committed to the repository.

## Monitoring Logs

### View Real-time Logs

```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Pretty print JSON logs
tail -f logs/combined.log | jq '.'
```

### Search Logs

```bash
# Search for specific text
grep "error" logs/combined.log

# Search with context
grep -C 5 "Failed" logs/combined.log

# Count occurrences
grep -c "AI recommendations" logs/combined.log
```

## Clean Up Logs

```bash
# Remove all log files
rm -rf logs/*.log

# Keep only recent logs (last 7 days)
find logs/ -name "*.log" -mtime +7 -delete
```

## Best Practices

1. **Use appropriate log levels** - Don't log everything as `error`
2. **Include context** - Add relevant IDs, user info, timestamps
3. **Avoid sensitive data** - Never log passwords, tokens, or PII
4. **Keep messages concise** - Clear and actionable messages
5. **Monitor regularly** - Check error logs periodically

## Examples

### Good Logging

```typescript
this.logger.info(`Sent ${count} recommendations to ${phoneNumber}`);
this.logger.error(`Failed to generate embedding: ${error.message}`);
this.logger.warn(`Subscriber ${id} has no preferences, skipping`);
```

### Bad Logging

```typescript
this.logger.info("Done"); // Too vague
this.logger.error(error); // Missing context
this.logger.info(JSON.stringify(userData)); // May contain PII
```

