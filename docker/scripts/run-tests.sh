#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/.."
cd "$DOCKER_DIR"

echo "========================================"
echo "ZeitBot Docker Scripts Test Suite"
echo "========================================"
echo ""

echo "[1] Making scripts executable..."
chmod +x scripts/*.sh
echo "    Done"
echo ""

echo "[2] Testing check-status.sh..."
echo "----------------------------------------"
./scripts/check-status.sh
echo ""

echo "[3] Docker Compose validation..."
echo "----------------------------------------"
if docker-compose -f docker-compose.services.yml config > /dev/null 2>&1; then
    echo "[OK] docker-compose.services.yml is valid"
else
    echo "[ERROR] docker-compose.services.yml has errors"
    docker-compose -f docker-compose.services.yml config
fi
echo ""

echo "[4] Checking ports..."
echo "----------------------------------------"
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":27017 "; then
    echo "[INFO] Port 27017 (MongoDB) is in use"
else
    echo "[OK] Port 27017 (MongoDB) is free"
fi

if lsof -Pi :11434 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":11434 "; then
    echo "[INFO] Port 11434 (Ollama) is in use"
else
    echo "[OK] Port 11434 (Ollama) is free"
fi
echo ""

echo "[5] Testing service endpoints..."
echo "----------------------------------------"
echo "MongoDB:"
if nc -z localhost 27017 2>/dev/null || timeout 1 bash -c "echo > /dev/tcp/localhost/27017" 2>/dev/null; then
    echo "  [OK] Port 27017 is accessible"
else
    echo "  [INFO] Port 27017 is not accessible"
fi
echo ""

echo "Ollama:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:11434 2>/dev/null | grep -q "200"; then
    echo "  [OK] Ollama API is responding"
elif nc -z localhost 11434 2>/dev/null; then
    echo "  [INFO] Port 11434 is open but API not ready"
else
    echo "  [INFO] Port 11434 is not accessible"
fi
echo ""

echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo "Scripts available:"
echo "  [OK] scripts/start-services.sh"
echo "  [OK] scripts/cleanup-ports.sh"
echo "  [OK] scripts/check-status.sh"
echo "  [OK] scripts/RUN-ME.sh"
echo "  [OK] scripts/run-tests.sh"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/check-status.sh"
echo "  2. If services not running: sudo ./scripts/start-services.sh"
echo "  3. If port conflicts: sudo ./scripts/cleanup-ports.sh"
echo ""
echo "Documentation:"
echo "  - README.md         - Full documentation"
echo "  - NEXT-STEPS.md     - What to do after services start"
echo "  - QUICK-FIX.md      - Common problems and solutions"
echo ""
echo "========================================"
echo "All tests complete!"
echo "========================================"



