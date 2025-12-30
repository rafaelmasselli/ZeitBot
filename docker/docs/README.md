# Docker Services - MongoDB and Ollama

MongoDB and Ollama in Docker. The ZeitBot application runs locally.

## Quick Start

```bash
# 1. Quick test (runs check-status automatically)
chmod +x scripts/*.sh
./scripts/RUN-ME.sh

# 2. Start services
sudo ./scripts/start-services.sh
# Select option 1 if ports are in use

# 3. Check status
./scripts/check-status.sh

# 4. Wait for LLama3 download (~4GB, 5-15 minutes)
docker-compose -f docker-compose.services.yml logs -f ollama-setup

# 5. Configure and run ZeitBot (see NEXT-STEPS.md)
cd ..
cat > .env << 'EOF'
DATABASE_URL=mongodb://localhost:27017/zeitbot
OLLAMA_URL=http://localhost:11434
EOF
npm install
npm run dev
```

## What It Does

All scripts are in the `scripts/` folder:

1. **scripts/start-services.sh** - Main script to start services
   - Checks Docker installation
   - Detects if services are already running
   - Detects port conflicts
   - Offers automatic cleanup or manual options
   - Starts MongoDB and Ollama containers

2. **scripts/cleanup-ports.sh** - Cleans up port conflicts
   - Stops old zeitbot containers
   - Stops local MongoDB/Ollama services
   - Kills processes using ports 27017 and 11434

3. **scripts/check-status.sh** - Check service status
   - Shows container status
   - Tests MongoDB connection
   - Tests Ollama API
   - Shows LLama3 download progress
   - Displays useful commands

4. **scripts/RUN-ME.sh** - Quick test runner
   - Runs status check automatically
   - Shows available commands
   - Gives context-specific next steps

5. **scripts/run-tests.sh** - Full test suite
   - Tests all scripts
   - Validates configuration
   - Checks ports and endpoints

## Service URLs

```bash
MongoDB:  mongodb://localhost:27017/zeitbot
Ollama:   http://localhost:11434
```

## Services Are Running?

If services are already running, see:
- **[NEXT-STEPS.md](NEXT-STEPS.md)** - What to do after services start
- **[../scripts/check-status.sh](../scripts/check-status.sh)** - Check service health

```bash
./scripts/check-status.sh
```

## Commands

### Start

```bash
docker-compose -f docker-compose.services.yml up -d
```

### Stop

```bash
docker-compose -f docker-compose.services.yml down
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.services.yml logs -f

# Specific service
docker-compose -f docker-compose.services.yml logs -f ollama
docker-compose -f docker-compose.services.yml logs -f ollama-setup
```

### Status

```bash
docker-compose -f docker-compose.services.yml ps
```

### Restart

```bash
docker-compose -f docker-compose.services.yml restart ollama
docker-compose -f docker-compose.services.yml restart mongodb
```

## Test Services

### MongoDB

```bash
# Connect
docker exec -it zeitbot-mongodb mongosh zeitbot

# Test connection from host
mongosh mongodb://localhost:27017/zeitbot
```

### Ollama

```bash
# Check if running
curl http://localhost:11434

# List models
docker exec -it zeitbot-ollama ollama list

# Test LLama3
docker exec -it zeitbot-ollama ollama run llama3
```

## Run Application

With services running, start the application locally:

```bash
# Install dependencies
npm install

# Configure .env
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

# Start application
npm run dev
```

## Persistent Volumes

Data is saved in Docker volumes:

```bash
# List volumes
docker volume ls | grep zeitbot

# Inspect
docker volume inspect zeitbot_mongodb_data
docker volume inspect zeitbot_ollama_data
```

## MongoDB Backup

```bash
# Backup
docker exec zeitbot-mongodb mongodump --db zeitbot --out /data/backup
docker cp zeitbot-mongodb:/data/backup ./backup

# Restore
docker cp ./backup zeitbot-mongodb:/data/backup
docker exec zeitbot-mongodb mongorestore /data/backup
```

## Clean Everything

```bash
# Stop and remove containers
docker-compose -f docker-compose.services.yml down

# Remove volumes (DELETES DATA)
docker-compose -f docker-compose.services.yml down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

## Troubleshooting

### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo ./scripts/start-services.sh
```

### Port Already in Use

See [QUICK-FIX.md](QUICK-FIX.md) for detailed solutions.

Quick fix:

```bash
# Run the cleanup script
chmod +x scripts/*.sh
sudo ./scripts/cleanup-ports.sh

# Then start services
sudo ./scripts/start-services.sh
```

### Manual Fix

```bash
# Stop existing containers
docker ps -a | grep zeitbot
docker stop <container-id>
docker rm <container-id>

# Stop local services
sudo systemctl stop mongodb
sudo systemctl stop mongod
pkill ollama

# Check if ports are free
netstat -tuln | grep -E ":(27017|11434)"
```

### Ollama Not Responding

```bash
# Check logs
docker-compose -f docker-compose.services.yml logs ollama

# Restart
docker-compose -f docker-compose.services.yml restart ollama

# Test
curl http://localhost:11434
```

### MongoDB Connection Failed

```bash
# Check status
docker-compose -f docker-compose.services.yml ps mongodb

# View logs
docker-compose -f docker-compose.services.yml logs mongodb

# Test connection
mongosh mongodb://localhost:27017/zeitbot
```

### LLama3 Not Downloaded

```bash
# View progress
docker-compose -f docker-compose.services.yml logs ollama-setup

# Download manually
docker exec -it zeitbot-ollama ollama pull llama3

# Verify
docker exec -it zeitbot-ollama ollama list
```

## Advanced Usage

### Check what is using a port

```bash
# Linux
sudo lsof -i :27017
sudo lsof -i :11434

# Or
sudo netstat -tuln | grep 27017
sudo netstat -tuln | grep 11434
```

### Force remove old containers

```bash
# Stop all zeitbot containers
docker ps -a | grep zeitbot | awk '{print $1}' | xargs docker stop
docker ps -a | grep zeitbot | awk '{print $1}' | xargs docker rm

# Or nuclear option (removes ALL containers)
docker container prune -f
```

### Rebuild containers

```bash
# Rebuild and restart
docker-compose -f docker-compose.services.yml up -d --build --force-recreate
```

## See Also

- [NEXT-STEPS.md](NEXT-STEPS.md) - What to do after services start
- [QUICK-FIX.md](QUICK-FIX.md) - Common problems and solutions
- [INDEX.md](INDEX.md) - File index
- [../scripts/README.md](../scripts/README.md) - Scripts documentation

