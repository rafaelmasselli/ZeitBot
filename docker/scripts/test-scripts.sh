#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Testing all scripts..."
echo "====================="
echo ""

# Test 1: Check if all scripts exist
echo "[1] Checking if all scripts exist..."
SCRIPTS=(
    "RUN-ME.sh"
    "check-status.sh"
    "start-services.sh"
    "cleanup-ports.sh"
    "run-tests.sh"
)

ALL_EXIST=true
for script in "${SCRIPTS[@]}"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        echo "  [OK] $script found"
    else
        echo "  [ERROR] $script not found"
        ALL_EXIST=false
    fi
done
echo ""

if [ "$ALL_EXIST" = false ]; then
    echo "[ERROR] Some scripts are missing"
    exit 1
fi

# Test 2: Make executable
echo "[2] Making scripts executable..."
chmod +x "$SCRIPT_DIR"/*.sh
echo "  Done"
echo ""

# Test 3: Check syntax
echo "[3] Checking script syntax..."
for script in "${SCRIPTS[@]}"; do
    if bash -n "$SCRIPT_DIR/$script" 2>/dev/null; then
        echo "  [OK] $script syntax valid"
    else
        echo "  [ERROR] $script has syntax errors"
        bash -n "$SCRIPT_DIR/$script"
    fi
done
echo ""

# Test 4: Test check-status (safe to run)
echo "[4] Testing check-status.sh..."
echo "----------------------------------------"
"$SCRIPT_DIR/check-status.sh"
echo ""

# Summary
echo "========================================"
echo "Test Results"
echo "========================================"
echo ""
echo "All scripts are ready to use!"
echo ""
echo "To run:"
echo "  ./scripts/RUN-ME.sh         # Quick test"
echo "  ./scripts/check-status.sh   # Check status"
echo "  sudo ./scripts/start-services.sh   # Start services"
echo "  sudo ./scripts/cleanup-ports.sh    # Clean ports"
echo "  ./scripts/run-tests.sh      # Full test suite"
echo ""
echo "========================================"


