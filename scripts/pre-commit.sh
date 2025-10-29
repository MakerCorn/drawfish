#!/bin/bash

# Pre-commit validation script for DrawFish
# This script runs linting and formatting checks before allowing commits

set -e

echo "🐟 DrawFish Pre-Commit Validation"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found. Please run 'npm install' first.${NC}"
    exit 1
fi

# Run ESLint
echo "📋 Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${RED}❌ ESLint failed. Please fix the errors above.${NC}"
    echo -e "${YELLOW}💡 Tip: Run 'npm run lint:fix' to auto-fix some issues${NC}"
    exit 1
fi

echo ""

# Check code formatting
echo "💅 Checking code formatting..."
if npm run format:check; then
    echo -e "${GREEN}✅ Code formatting is correct${NC}"
else
    echo -e "${RED}❌ Code formatting issues found.${NC}"
    echo -e "${YELLOW}💡 Tip: Run 'npm run format' to auto-format your code${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All checks passed! Ready to commit.${NC}"
exit 0
