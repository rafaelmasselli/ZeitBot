# Docker Setup for ZeitBot

MongoDB and Ollama services in Docker containers.

## Quick Start

```bash
# 1. Quick test
./scripts/RUN-ME.sh

# 2. Start services
sudo ./scripts/start-services.sh

# 3. Check status
./scripts/check-status.sh
```

## Structure

```
docker/
├── scripts/              # All executable scripts
│   ├── RUN-ME.sh
│   ├── check-status.sh
│   ├── start-services.sh
│   ├── cleanup-ports.sh
│   ├── run-tests.sh
│   └── test-scripts.sh
│
├── docs/                 # All documentation
│   ├── README.md         # Full documentation
│   ├── NEXT-STEPS.md     # After services start
│   ├── QUICK-FIX.md      # Common problems
│   └── INDEX.md          # File index
│
├── docker-compose.services.yml
└── test-all.sh
```

## Documentation

- **[docs/README.md](docs/README.md)** - Complete documentation
- **[docs/NEXT-STEPS.md](docs/NEXT-STEPS.md)** - What to do after services start
- **[docs/QUICK-FIX.md](docs/QUICK-FIX.md)** - Common problems and solutions
- **[docs/INDEX.md](docs/INDEX.md)** - File index and overview
- **[scripts/README.md](scripts/README.md)** - Scripts documentation

## Scripts

| Script                        | Purpose                      |
|-------------------------------|------------------------------|
| **scripts/RUN-ME.sh**         | Quick test runner            |
| **scripts/check-status.sh**   | Check service status         |
| **scripts/start-services.sh** | Start MongoDB and Ollama     |
| **scripts/cleanup-ports.sh**  | Clean port conflicts         |
| **scripts/run-tests.sh**      | Full test suite              |
| **scripts/test-scripts.sh**   | Validate all scripts         |

## Service URLs

```
MongoDB:  mongodb://localhost:27017/zeitbot
Ollama:   http://localhost:11434
```

## Common Commands

```bash
# Start services
sudo ./scripts/start-services.sh

# Check status
./scripts/check-status.sh

# View logs
docker-compose -f docker-compose.services.yml logs -f

# Stop services
docker-compose -f docker-compose.services.yml down
```

## Help

- Port conflicts? See [docs/QUICK-FIX.md](docs/QUICK-FIX.md)
- Services running? See [docs/NEXT-STEPS.md](docs/NEXT-STEPS.md)
- Need details? See [docs/README.md](docs/README.md)



