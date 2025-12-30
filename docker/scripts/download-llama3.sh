#!/bin/bash

echo "Downloading LLama3 Model"
echo "========================"
echo ""

echo "This will:"
echo "1. Wait for Ollama to be ready"
echo "2. Download LLama3 (~4GB, 5-15 minutes)"
echo "3. Verify the installation"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "Waiting for Ollama to be ready..."
RETRY=0
until curl -s http://localhost:11434 >/dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge 20 ]; then
        echo "[ERROR] Ollama is not responding"
        echo "Make sure Ollama is running: docker ps | grep ollama"
        exit 1
    fi
    echo "  Waiting... ($RETRY/20)"
    sleep 3
done

echo "[OK] Ollama is ready!"
echo ""

echo "Starting download..."
echo "--------------------"
docker exec -it zeitbot-ollama ollama pull llama3

echo ""
echo "Verifying installation..."
echo "-------------------------"
docker exec -it zeitbot-ollama ollama list

echo ""
echo "[OK] LLama3 is ready!"
echo ""
echo "Test it with:"
echo "  docker exec -it zeitbot-ollama ollama run llama3"

