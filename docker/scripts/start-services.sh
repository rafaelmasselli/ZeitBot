#!/bin/bash

DOCKER_DIR="$(dirname "$0")/.."
cd "$DOCKER_DIR"

echo "Starting MongoDB and Ollama"
echo "=============================="
echo ""

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "[OK] Docker and Docker Compose found"
echo ""

if ! docker info &> /dev/null; then
    echo "[ERROR] Cannot connect to Docker daemon."
    echo ""
    echo "Possible solutions:"
    echo "  1. Start Docker daemon: sudo systemctl start docker"
    echo "  2. Add your user to docker group: sudo usermod -aG docker \$USER"
    echo "     (then logout and login again)"
    echo "  3. Run with sudo: sudo ./start-services.sh"
    echo ""
    exit 1
fi

echo "[OK] Docker daemon is running"
echo ""

if docker ps | grep -q "zeitbot-mongodb" && docker ps | grep -q "zeitbot-ollama"; then
    echo "[INFO] ZeitBot services are already running!"
    echo ""
    docker-compose -f docker-compose.services.yml ps
    echo ""
    echo "Options:"
    echo "  1) View logs"
    echo "  2) Restart services"
    echo "  3) Stop services"
    echo "  4) Exit"
    echo ""
    read -p "Choose option (1/2/3/4): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo "Showing logs (Ctrl+C to exit)..."
            docker-compose -f docker-compose.services.yml logs -f
            exit 0
            ;;
        2)
            echo "Restarting services..."
            docker-compose -f docker-compose.services.yml restart
            docker-compose -f docker-compose.services.yml ps
            exit 0
            ;;
        3)
            echo "Stopping services..."
            docker-compose -f docker-compose.services.yml down
            echo "[OK] Services stopped"
            exit 0
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option. Exiting."
            exit 1
            ;;
    esac
fi

echo "Checking if ports are available..."
MONGODB_PORT=27017
OLLAMA_PORT=11434
PORTS_IN_USE=false

if lsof -Pi :$MONGODB_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$MONGODB_PORT "; then
    echo "[WARNING] Port $MONGODB_PORT (MongoDB) is already in use"
    PORTS_IN_USE=true
fi

if lsof -Pi :$OLLAMA_PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$OLLAMA_PORT "; then
    echo "[WARNING] Port $OLLAMA_PORT (Ollama) is already in use"
    PORTS_IN_USE=true
fi

if [ "$PORTS_IN_USE" = true ]; then
    echo ""
    echo "Options:"
    echo "  1) Auto-cleanup (stop services using these ports)"
    echo "  2) Manual fix (exit and fix manually)"
    echo "  3) Continue anyway (will likely fail)"
    echo ""
    read -p "Choose option (1/2/3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            echo ""
            echo "Running cleanup script..."
            chmod +x scripts/cleanup-ports.sh
            ./scripts/cleanup-ports.sh
            echo ""
            ;;
        2)
            echo ""
            echo "To fix manually, run:"
            echo "  ./scripts/cleanup-ports.sh"
            echo ""
            exit 1
            ;;
        3)
            echo ""
            echo "Continuing anyway..."
            ;;
        *)
            echo "Invalid option. Exiting."
            exit 1
            ;;
    esac
fi

echo ""
echo "Starting MongoDB and Ollama..."
docker-compose -f docker-compose.services.yml up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Services status:"
docker-compose -f docker-compose.services.yml ps

echo ""
echo "Downloading LLama3 model..."
echo "    This will take a few minutes (~4GB download)"
echo ""
echo "    Check progress with:"
echo "    docker-compose -f docker-compose.services.yml logs -f ollama-setup"

echo ""
echo "[OK] Services started!"
echo ""
echo "Service URLs:"
echo "    MongoDB:  mongodb://localhost:27017/zeitbot"
echo "    Ollama:   http://localhost:11434"
echo ""
echo "Test Ollama:"
echo "    curl http://localhost:11434"
echo "    docker exec -it zeitbot-ollama ollama list"
echo ""
echo "Useful commands:"
echo "    docker-compose -f docker-compose.services.yml logs -f          # View all logs"
echo "    docker-compose -f docker-compose.services.yml ps               # Check status"
echo "    docker-compose -f docker-compose.services.yml down             # Stop services"
echo "    docker-compose -f docker-compose.services.yml restart ollama   # Restart Ollama"
echo ""

