# Next Steps - Services Are Running!

Your MongoDB and Ollama containers are running. Here's what to do next:

## 1. Wait for LLama3 Download

The LLama3 model (~4GB) is downloading. Check progress:

```bash
# Watch download progress
docker-compose -f docker-compose.services.yml logs -f ollama-setup

# When complete, you'll see:
# "LLama3 model ready!"
```

This usually takes 5-15 minutes depending on your internet speed.

## 2. Verify Services

```bash
# Check all services
chmod +x scripts/*.sh
./scripts/check-status.sh

# Or manually
docker-compose -f docker-compose.services.yml ps

# Test MongoDB
mongosh mongodb://localhost:27017/zeitbot

# Test Ollama
curl http://localhost:11434

# List Ollama models
docker exec -it zeitbot-ollama ollama list
```

## 3. Configure ZeitBot Application

```bash
# Go to project root
cd ..

# Create .env file
cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/zeitbot
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=llama3
NEWS_CRON_INTERVAL=0 */2 * * *
NEWS_EMBEDDINGS_CRON_INTERVAL=*/10 * * * *
WHATSAPP_CRON_INTERVAL=0 8 * * *
WHATSAPP_AI_CRON_INTERVAL=0 8 * * *
EOF
```

## 4. Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

## 5. Run ZeitBot

```bash
# Start the application
npm run dev

# You should see:
# - Database connection
# - WhatsApp QR code (scan with your phone)
# - Jobs starting
```

## 6. Scan WhatsApp QR Code

When the application starts, a QR code will appear in the terminal. Scan it with WhatsApp on your phone to authenticate the bot.

## 7. Test the Bot

Send these commands to your bot on WhatsApp:

```
!help
!news
!subscribe
!preferences I like technology, AI, and innovation
```

## 8. Monitor Everything

```bash
# Terminal 1: ZeitBot app
npm run dev

# Terminal 2: Docker services
cd docker
docker-compose -f docker-compose.services.yml logs -f

# Terminal 3: Check status
cd docker
./scripts/check-status.sh
```

## Common Issues

### LLama3 download stuck?

```bash
# Check logs
docker-compose -f docker-compose.services.yml logs ollama-setup

# Manual download
docker exec -it zeitbot-ollama ollama pull llama3
```

### MongoDB not connecting?

```bash
# Check if running
docker ps | grep mongodb

# Check logs
docker-compose -f docker-compose.services.yml logs mongodb

# Restart
docker-compose -f docker-compose.services.yml restart mongodb
```

### Ollama not responding?

```bash
# Check if running
curl http://localhost:11434

# Check logs
docker-compose -f docker-compose.services.yml logs ollama

# Restart
docker-compose -f docker-compose.services.yml restart ollama
```

## Need to Stop Services?

```bash
# Stop services
docker-compose -f docker-compose.services.yml down

# Stop and remove volumes (deletes data)
docker-compose -f docker-compose.services.yml down -v
```

## Ready to Deploy?

Your development environment is ready! For production deployment, consider:

1. Using environment variables for secrets
2. Setting up proper MongoDB authentication
3. Configuring firewall rules
4. Setting up monitoring and logging
5. Creating backups for MongoDB data

See [README.md](README.md) for more details.


