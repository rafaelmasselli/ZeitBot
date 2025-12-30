# Docker Directory Index

Complete overview of Docker setup files.

## Directory Structure

```
docker/
├── scripts/              # All executable scripts
├── docs/                 # All documentation
├── docker-compose.services.yml
└── test-all.sh
```

## Scripts

All executable scripts are in `scripts/`:

| Script                        | Purpose                      | Usage                               |
|-------------------------------|------------------------------|-------------------------------------|
| **scripts/RUN-ME.sh**         | Quick test runner            | `./scripts/RUN-ME.sh`               |
| **scripts/check-status.sh**   | Check service status         | `./scripts/check-status.sh`         |
| **scripts/start-services.sh** | Start MongoDB and Ollama     | `sudo ./scripts/start-services.sh`  |
| **scripts/cleanup-ports.sh**  | Clean port conflicts         | `sudo ./scripts/cleanup-ports.sh`   |
| **scripts/run-tests.sh**      | Full test suite              | `./scripts/run-tests.sh`            |
| **scripts/test-scripts.sh**   | Validate all scripts         | `./scripts/test-scripts.sh`         |

## Documentation

All documentation files are in `docs/`:

| File                   | Purpose                                              |
|------------------------|------------------------------------------------------|
| **docs/README.md**     | Complete documentation with commands                 |
| **docs/NEXT-STEPS.md** | What to do after services start                      |
| **docs/QUICK-FIX.md**  | Common problems and solutions                        |
| **docs/INDEX.md**      | This file - overview                                 |
| **scripts/README.md**  | Scripts documentation                                |

## Configuration

| File                              | Purpose                                    |
|-----------------------------------|--------------------------------------------|
| **docker-compose.services.yml**   | Docker Compose config (MongoDB + Ollama)   |

## Quick Start

```bash
# 1. Test everything
./scripts/RUN-ME.sh

# 2. Check status
./scripts/check-status.sh

# 3. If ports in use
sudo ./scripts/cleanup-ports.sh

# 4. Start services
sudo ./scripts/start-services.sh
```

## Script Details

| Script                | What It Does                                                    |
|-----------------------|-----------------------------------------------------------------|
| **start-services.sh** | Checks Docker, detects conflicts, starts services               |
| **cleanup-ports.sh**  | Stops containers, frees ports 27017 and 11434                   |
| **check-status.sh**   | Shows status, tests connections, lists models                   |
| **RUN-ME.sh**         | Quick status + context-specific next steps                      |
| **run-tests.sh**      | Full validation suite                                           |
| **test-scripts.sh**   | Validates all scripts exist and have correct syntax             |

## Workflow

### First Time Setup

```bash
1. cd /home/rafael/projects/est/ZeitBot/docker
2. ./scripts/RUN-ME.sh                     # Quick check
3. sudo ./scripts/start-services.sh        # Start services
4. ./scripts/check-status.sh               # Verify
5. Read docs/NEXT-STEPS.md                 # Configure ZeitBot
```

### If Services Already Running

```bash
1. ./scripts/check-status.sh               # Check status
2. docker-compose -f docker-compose.services.yml logs -f ollama-setup
3. Read docs/NEXT-STEPS.md
```

### If Port Conflicts

```bash
1. sudo ./scripts/cleanup-ports.sh         # Clean ports
2. sudo ./scripts/start-services.sh        # Start services
3. ./scripts/check-status.sh               # Verify
```

### Troubleshooting

```bash
1. Read docs/QUICK-FIX.md                  # Common issues
2. ./scripts/check-status.sh               # Diagnose
3. Read docs/README.md                     # Full docs
```

## Service URLs

```
MongoDB:  mongodb://localhost:27017/zeitbot
Ollama:   http://localhost:11434
```

## Common Commands

```bash
# View logs
docker-compose -f docker-compose.services.yml logs -f

# Stop services
docker-compose -f docker-compose.services.yml down

# Restart
docker-compose -f docker-compose.services.yml restart

# Test MongoDB
mongosh mongodb://localhost:27017/zeitbot

# Test Ollama
curl http://localhost:11434

# List models
docker exec -it zeitbot-ollama ollama list
```

## Help

- **Quick fix**: Read docs/QUICK-FIX.md
- **Step by step**: Read docs/NEXT-STEPS.md
- **Full docs**: Read docs/README.md
- **Scripts**: Read scripts/README.md

