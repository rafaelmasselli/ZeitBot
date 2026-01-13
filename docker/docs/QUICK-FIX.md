# Quick Fix Guide

## Problem: Port Already in Use

```
ERROR: address already in use
Port 27017 (MongoDB) is already in use
Port 11434 (Ollama) is already in use
```

## Solution

```bash
# 1. Run cleanup script
cd docker
chmod +x scripts/*.sh
sudo ./scripts/cleanup-ports.sh

# 2. Start services
sudo ./scripts/start-services.sh
```

## What the cleanup script does

1. Stops old zeitbot Docker containers
2. Stops local MongoDB service
3. Stops local Ollama process
4. Kills any process using ports 27017 and 11434

## Verify it worked

```bash
# Check if ports are free
sudo netstat -tuln | grep -E ":(27017|11434)"
# Should return nothing

# Check Docker containers
sudo docker ps
# Should show zeitbot-mongodb and zeitbot-ollama running
```

## Still not working?

### Find what is using the ports

```bash
# Check MongoDB port
sudo lsof -i :27017

# Check Ollama port
sudo lsof -i :11434
```

### Kill specific process

```bash
# Kill by PID (replace 12345 with actual PID)
sudo kill -9 12345
```

### Use different ports

Edit `docker-compose.services.yml`:

```yaml
mongodb:
  ports:
    - "27018:27017"  # Change to 27018

ollama:
  ports:
    - "11435:11434"  # Change to 11435
```

Then update your `.env`:

```env
DATABASE_URL=mongodb://localhost:27018/zeitbot
OLLAMA_URL=http://localhost:11435
```

## After fixing

```bash
# Test MongoDB
curl -v mongodb://localhost:27017

# Test Ollama
curl http://localhost:11434

# View logs
cd docker
sudo docker-compose -f docker-compose.services.yml logs -f
```


