#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/.."
cd "$DOCKER_DIR"

echo ""
echo "Quick Test - ZeitBot Docker Scripts"
echo "===================================="
echo ""

# Make executable
chmod +x scripts/*.sh 2>/dev/null

echo "Available commands:"
echo ""
echo "1. ./scripts/check-status.sh"
echo "   Check current status of all services"
echo ""
echo "2. sudo ./scripts/cleanup-ports.sh"
echo "   Clean up port conflicts (27017, 11434)"
echo ""
echo "3. sudo ./scripts/start-services.sh"
echo "   Start MongoDB and Ollama containers"
echo ""
echo "4. ./scripts/run-tests.sh"
echo "   Run full test suite"
echo ""
echo "===================================="
echo ""

# Auto-run check-status
echo "Running status check..."
echo ""
./scripts/check-status.sh

echo ""
echo "===================================="
echo "What to do next?"
echo "===================================="
echo ""

if docker ps | grep -q "zeitbot-mongodb" && docker ps | grep -q "zeitbot-ollama"; then
    echo "[OK] Services are running!"
    echo ""
    echo "Next steps:"
    echo "  1. Check LLama3 download:"
    echo "     docker-compose -f docker-compose.services.yml logs -f ollama-setup"
    echo ""
    echo "  2. When complete, configure ZeitBot:"
    echo "     cd .."
    echo "     cat docker/NEXT-STEPS.md"
    echo ""
else
    echo "[INFO] Services are not running"
    echo ""
    echo "To start services:"
    echo "  sudo ./scripts/start-services.sh"
    echo ""
    echo "If ports are in use:"
    echo "  sudo ./scripts/cleanup-ports.sh"
    echo "  sudo ./scripts/start-services.sh"
    echo ""
fi

echo "===================================="

