#!/bin/bash

DOCKER_DIR="$(dirname "$0")/.."
cd "$DOCKER_DIR"

echo "ZeitBot Docker Services Status"
echo "=============================="
echo ""

if ! docker info &> /dev/null; then
    echo "[ERROR] Docker is not running"
    exit 1
fi

echo "[1] Container Status:"
echo "--------------------"
docker-compose -f docker-compose.services.yml ps
echo ""

echo "[2] MongoDB:"
echo "------------"
if docker ps | grep -q "zeitbot-mongodb"; then
    echo "[OK] Container running"
    if docker exec zeitbot-mongodb mongosh --eval "db.runCommand('ping')" zeitbot &> /dev/null; then
        echo "[OK] Database responding"
    else
        echo "[WARNING] Database not responding yet (may be starting)"
    fi
else
    echo "[ERROR] Container not running"
fi
echo ""

echo "[3] Ollama:"
echo "-----------"
if docker ps | grep -q "zeitbot-ollama"; then
    echo "[OK] Container running"
    if curl -s http://localhost:11434 &> /dev/null; then
        echo "[OK] API responding"
        echo ""
        echo "Available models:"
        docker exec zeitbot-ollama ollama list 2>/dev/null || echo "    (loading...)"
    else
        echo "[WARNING] API not responding yet (may be starting)"
    fi
else
    echo "[ERROR] Container not running"
fi
echo ""

echo "[4] LLama3 Model:"
echo "-----------------"
if docker ps -a | grep -q "zeitbot-ollama-setup"; then
    STATUS=$(docker ps -a --filter "name=zeitbot-ollama-setup" --format "{{.Status}}")
    if echo "$STATUS" | grep -q "Up"; then
        echo "[INFO] Still downloading..."
        echo ""
        echo "Check progress with:"
        echo "  docker-compose -f docker-compose.services.yml logs -f ollama-setup"
    elif echo "$STATUS" | grep -q "Exited (0)"; then
        echo "[OK] Download complete"
    else
        echo "[WARNING] Status: $STATUS"
    fi
else
    echo "[INFO] Setup not run yet"
fi
echo ""

echo "[5] Quick Commands:"
echo "-------------------"
echo "  View logs:        docker-compose -f docker-compose.services.yml logs -f"
echo "  Stop services:    docker-compose -f docker-compose.services.yml down"
echo "  Restart:          docker-compose -f docker-compose.services.yml restart"
echo ""
echo "  Test MongoDB:     mongosh mongodb://localhost:27017/zeitbot"
echo "  Test Ollama:      curl http://localhost:11434"
echo "  Test LLama3:      docker exec -it zeitbot-ollama ollama run llama3"
echo ""

