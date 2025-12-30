#!/bin/bash

DOCKER_DIR="$(dirname "$0")/.."
cd "$DOCKER_DIR"

echo "Resetting Ollama and downloading LLama3"
echo "========================================"
echo ""

echo "[1] Stopping ollama-setup container..."
docker stop zeitbot-ollama-setup 2>/dev/null || true
docker rm zeitbot-ollama-setup 2>/dev/null || true
echo "    Done"
echo ""

echo "[2] Restarting Ollama service..."
docker-compose -f docker-compose.services.yml restart ollama
echo "    Done"
echo ""

echo "[3] Waiting for Ollama to be ready..."
echo "    (waiting 15 seconds for service to stabilize)"
sleep 15

echo "    Checking if Ollama is responding..."
RETRY=0
until curl -s http://localhost:11434 >/dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge 10 ]; then
        echo "    [WARNING] Ollama not responding yet, continuing anyway..."
        break
    fi
    echo "    Still waiting... ($RETRY/10)"
    sleep 3
done
echo "    Done"
echo ""

echo "[4] Starting LLama3 download..."
echo "    This will take 5-15 minutes (~4GB)"
echo ""
docker-compose -f docker-compose.services.yml up -d ollama-setup
echo ""

echo "[5] Monitoring download progress..."
echo "    Press Ctrl+C to exit (download continues in background)"
echo "----------------------------------------"
docker-compose -f docker-compose.services.yml logs -f ollama-setup

