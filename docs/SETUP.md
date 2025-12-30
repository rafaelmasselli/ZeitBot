# Setup & Installation

Quick guide to install and run ZeitBot.

## Prerequisites

- **Node.js** >= 18
- **MongoDB** >= 6.0
- **Ollama** with LLama3

## Install Dependencies

### 1. MongoDB

```bash
# Ubuntu/Debian
sudo apt install -y mongodb-org

# macOS
brew install mongodb-community@6.0
brew services start mongodb-community
```

### 2. Ollama + LLama3

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3

# Start service
ollama serve

# Verify
curl http://localhost:11434
# Should return: "Ollama is running"
```

### 3. Node Packages

```bash
cd server
npm install
```

## Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required
DATABASE_URL=mongodb://localhost:27017/zeitbot
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434

# Optional (adjust cron schedules)
NEWS_CRON_INTERVAL=0 */2 * * *          # Every 2 hours
WHATSAPP_AI_CRON_INTERVAL=0 8 * * *     # 8 AM daily
```

## First Run

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: MongoDB (if not service)
mongod

# Terminal 3: ZeitBot
npm run dev
```

**Expected**:
1. QR code appears → Scan with WhatsApp
2. "WhatsApp client is ready!"
3. "Starting news save process"
4. "News Embeddings Job scheduled"

## Test Installation

```bash
# Test Ollama integration
npm run test:ollama

# Test embeddings
npm run test:embeddings

# Test recommendations
npm run test:ai
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check status
sudo systemctl status mongod

# Start
sudo systemctl start mongod

# Test connection
mongosh zeitbot
```

### Ollama Not Responding

```bash
# Kill existing
killall ollama

# Start fresh
ollama serve

# Verify model
ollama list
```

### WhatsApp QR Not Showing

```bash
# Delete auth folder
rm -rf .wwebjs_auth/

# Restart
npm run dev
```

## Monitoring Logs

All logs are automatically saved to the `logs/` directory:

```bash
# View real-time logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Pretty print JSON
tail -f logs/combined.log | jq '.'
```

For more details, see [LOGS.md](LOGS.md).

## Next Steps

- [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the system
- [WHATSAPP_MODULE.md](WHATSAPP_MODULE.md) - WhatsApp commands
- [AI_SYSTEM.md](AI_SYSTEM.md) - How AI works
- [LOGS.md](LOGS.md) - Logging system
