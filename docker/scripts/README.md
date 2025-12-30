# Docker Scripts

Automation scripts for managing MongoDB and Ollama containers.

## Scripts

| Script                   | Purpose                  | Usage                          | Requires Sudo |
|--------------------------|--------------------------|--------------------------------|---------------|
| **RUN-ME.sh**            | Quick test runner        | `./RUN-ME.sh`                  | No            |
| **check-status.sh**      | Check service status     | `./check-status.sh`            | No            |
| **start-services.sh**    | Start services           | `sudo ./start-services.sh`     | Yes           |
| **cleanup-ports.sh**     | Clean port conflicts     | `sudo ./cleanup-ports.sh`      | Yes           |
| **run-tests.sh**         | Full test suite          | `./run-tests.sh`               | No            |
| **test-scripts.sh**      | Validate scripts         | `./test-scripts.sh`            | No            |

## Quick Usage

```bash
cd /home/rafael/projects/est/ZeitBot/docker

# 1. Quick test
./scripts/RUN-ME.sh

# 2. Check status
./scripts/check-status.sh

# 3. Start services (if not running)
sudo ./scripts/start-services.sh

# 4. Clean ports (if conflicts)
sudo ./scripts/cleanup-ports.sh
```

## Script Details

| Script                | What It Does                                                    |
|-----------------------|-----------------------------------------------------------------|
| **RUN-ME.sh**         | Auto status check + shows commands + context-specific steps    |
| **check-status.sh**   | Container status + health checks + model list + quick commands |
| **start-services.sh** | Docker check + conflict detection + auto-cleanup + starts services |
| **cleanup-ports.sh**  | Stops containers + kills processes + frees ports 27017/11434   |
| **run-tests.sh**      | Full validation + port checks + endpoint tests + summary       |
| **test-scripts.sh**   | Validates existence + syntax + runs basic tests                |

## Workflow

### First Time

```bash
# 1. Test
./scripts/RUN-ME.sh

# 2. Start
sudo ./scripts/start-services.sh

# 3. Verify
./scripts/check-status.sh
```

### Port Conflicts

```bash
# 1. Clean
sudo ./scripts/cleanup-ports.sh

# 2. Start
sudo ./scripts/start-services.sh

# 3. Verify
./scripts/check-status.sh
```

### Services Running

```bash
# 1. Check
./scripts/check-status.sh

# 2. View logs
docker-compose -f docker-compose.services.yml logs -f

# 3. Follow NEXT-STEPS.md
cat NEXT-STEPS.md
```

## Exit Codes

All scripts return:
- `0` - Success
- `1` - Error or user cancelled

## Requirements

- Docker installed and running
- docker-compose installed
- sudo access (for some scripts)
- Ports 27017 and 11434 available

## See Also

- [../README.md](../README.md) - Full documentation
- [../NEXT-STEPS.md](../NEXT-STEPS.md) - What to do after services start
- [../QUICK-FIX.md](../QUICK-FIX.md) - Common problems

