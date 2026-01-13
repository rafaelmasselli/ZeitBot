#!/bin/bash

echo "Cleaning up ports 27017 (MongoDB) and 11434 (Ollama)"
echo "======================================================"
echo ""

echo "[1] Stopping old zeitbot containers..."
sudo docker stop zeitbot-mongodb zeitbot-ollama zeitbot-ollama-setup 2>/dev/null || true
sudo docker rm zeitbot-mongodb zeitbot-ollama zeitbot-ollama-setup 2>/dev/null || true
echo "    Done"
echo ""

echo "[2] Stopping local MongoDB services..."
sudo systemctl stop mongodb 2>/dev/null || true
sudo systemctl stop mongod 2>/dev/null || true
sudo pkill -9 mongod 2>/dev/null || true
echo "    Done"
echo ""

echo "[3] Stopping local Ollama..."
sudo pkill -9 ollama 2>/dev/null || true
echo "    Done"
echo ""

echo "[4] Checking ports..."
MONGODB_CHECK=$(sudo lsof -ti:27017 2>/dev/null)
OLLAMA_CHECK=$(sudo lsof -ti:11434 2>/dev/null)

if [ -n "$MONGODB_CHECK" ]; then
    echo "    Port 27017 still in use by PID: $MONGODB_CHECK"
    echo "    Killing process..."
    sudo kill -9 $MONGODB_CHECK 2>/dev/null || true
else
    echo "    Port 27017 is free"
fi

if [ -n "$OLLAMA_CHECK" ]; then
    echo "    Port 11434 still in use by PID: $OLLAMA_CHECK"
    echo "    Killing process..."
    sudo kill -9 $OLLAMA_CHECK 2>/dev/null || true
else
    echo "    Port 11434 is free"
fi

echo ""
echo "[OK] Cleanup complete!"
echo ""
echo "Now you can run:"
echo "  ./scripts/start-services.sh"


