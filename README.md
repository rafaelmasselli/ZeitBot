# ZeitBot - AI-Powered News Bot

An intelligent WhatsApp bot that delivers personalized news using neural network embeddings.

## What it Does

ZeitBot fetches news from multiple sources, analyzes them with AI (LLama3), and sends personalized recommendations to WhatsApp users based on their interests.

## Key Features

- **AI Recommendations** - Semantic understanding with 4096-dimensional vectors
- **Multi-Source Aggregation** - BBC, Brasil de Fato
- **Personalized Matching** - Cosine similarity for relevance
- **WhatsApp Bot** - Interactive commands
- **Automated Jobs** - Scheduled fetching and delivery
- **Clean Architecture** - SOLID principles, modular design

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Start MongoDB and Ollama
cd docker
./start-services.sh

# 2. Install dependencies
npm install

# 3. Configure
cp docker/.env.example .env

# 4. Run
npm run dev
# Scan WhatsApp QR code
```

### Option 2: Manual Setup

```bash
# 1. Install MongoDB and Ollama locally

# 2. Install dependencies
npm install

# 3. Configure
cp .env.example .env
# Edit: DATABASE_URL, AI_PROVIDER=ollama

# 4. Start Ollama
ollama pull llama3
ollama serve

# 5. Run
npm run dev
# Scan WhatsApp QR code
```

## Documentation

| Document                                  | Purpose                         |
| ----------------------------------------- | ------------------------------- |
| [SETUP.md](docs/SETUP.md)                 | Installation and first run      |
| [DOCKER.md](docker/README.md)             | Docker setup (MongoDB + Ollama) |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)   | System design and patterns      |
| [AI_SYSTEM.md](docs/AI_SYSTEM.md)         | How embeddings work             |
| [CONFIGURATION.md](docs/CONFIGURATION.md) | Environment variables           |

## WhatsApp Commands

```
!help                  # Show commands
!news                  # Get latest news
!subscribe             # Subscribe to daily news
!preferences <text>    # Set AI preferences
!mysubscription        # Check status
```

## How It Works

```
1. News Sources → Fetch (every 2h)
2. LLama3 → Generate embeddings (4096D vectors)
3. MongoDB → Store news + vectors
4. User sets preferences → Generate preference vector
5. Cron (8 AM) → Calculate similarity
6. WhatsApp → Send top 5 matches
```

## Technology Stack

- **Backend**: Node.js + TypeScript
- **Database**: MongoDB
- **AI**: Ollama (LLama3)
- **WhatsApp**: whatsapp-web.js
- **DI**: tsyringe
- **Testing**: Jest

## Testing

```bash
npm test                    # Unit tests
npm run test:ollama        # Test AI analysis
npm run test:embeddings    # Test vectors
npm run test:ai            # Test recommendations
```

## Requirements

- Node.js >= 18
- MongoDB >= 6.0
- Ollama with LLama3
- WhatsApp account

## License

MIT
