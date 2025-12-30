#!/bin/bash

echo "======================================"
echo "Testing ZeitBot Docker Setup"
echo "======================================"
echo ""

cd "$(dirname "$0")"

echo "[1] Directory structure..."
echo "--------------------------------------"
echo "Checking folders:"
if [ -d "scripts" ]; then
    echo "  [OK] scripts/ folder exists"
    SCRIPT_COUNT=$(ls -1 scripts/*.sh 2>/dev/null | wc -l)
    echo "  [OK] Found $SCRIPT_COUNT scripts"
else
    echo "  [ERROR] scripts/ folder not found"
fi

if [ -d "docs" ]; then
    echo "  [OK] docs/ folder exists"
    DOC_COUNT=$(ls -1 docs/*.md 2>/dev/null | wc -l)
    echo "  [OK] Found $DOC_COUNT documentation files"
else
    echo "  [ERROR] docs/ folder not found"
fi
echo ""

echo "[2] Make scripts executable..."
chmod +x scripts/*.sh 2>/dev/null
echo "    Done"
echo ""

echo "[3] Running script validation..."
echo "--------------------------------------"
./scripts/test-scripts.sh
echo ""

echo "======================================"
echo "Test Complete!"
echo "======================================"
echo ""
echo "Structure:"
echo "  docker/"
echo "  ├── scripts/       (executable scripts)"
echo "  ├── docs/          (documentation)"
echo "  ├── docker-compose.services.yml"
echo "  └── README.md"
echo ""
echo "Quick commands:"
echo "  ./scripts/RUN-ME.sh              # Quick test"
echo "  ./scripts/check-status.sh        # Check status"
echo "  sudo ./scripts/start-services.sh # Start services"
echo ""
echo "Documentation:"
echo "  docs/README.md       # Full docs"
echo "  docs/NEXT-STEPS.md   # After services start"
echo "  docs/QUICK-FIX.md    # Common problems"
echo ""

