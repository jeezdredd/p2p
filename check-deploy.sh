#!/bin/bash

echo "Checking deployment readiness..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check if git repo is clean
echo "1. Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    warnings=$((warnings+1))
else
    echo -e "${GREEN}OK: Git repository is clean${NC}"
fi

# Check if .env files are in gitignore
echo ""
echo "2. Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}OK: .env is in .gitignore${NC}"
else
    echo -e "${RED}ERROR: .env should be in .gitignore${NC}"
    errors=$((errors+1))
fi

# Check required files
echo ""
echo "3. Checking required files..."

files=(
    "backend/Procfile"
    "backend/runtime.txt"
    "backend/entrypoint.sh"
    "backend/requirements/production.txt"
    "backend/config/settings/production.py"
    "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}OK: $file exists${NC}"
    else
        echo -e "${RED}ERROR: $file is missing${NC}"
        errors=$((errors+1))
    fi
done

# Check backend requirements
echo ""
echo "4. Checking backend requirements..."
cd backend
if grep -q "gunicorn" requirements/production.txt || grep -q "gunicorn" requirements/base.txt; then
    echo -e "${GREEN}OK: gunicorn is in requirements${NC}"
else
    echo -e "${RED}ERROR: gunicorn is missing from requirements${NC}"
    errors=$((errors+1))
fi

if grep -q "psycopg2" requirements/base.txt; then
    echo -e "${GREEN}OK: psycopg2 is in requirements${NC}"
else
    echo -e "${RED}ERROR: psycopg2 is missing from requirements${NC}"
    errors=$((errors+1))
fi

# Check frontend build
echo ""
echo "5. Checking frontend..."
cd ../frontend
if [[ -f "package.json" ]]; then
    if grep -q "\"build\":" package.json; then
        echo -e "${GREEN}OK: build script exists in package.json${NC}"
    else
        echo -e "${RED}ERROR: build script missing in package.json${NC}"
        errors=$((errors+1))
    fi
    
    if grep -q "\"preview\":" package.json; then
        echo -e "${GREEN}OK: preview script exists in package.json${NC}"
    else
        echo -e "${YELLOW}Warning: preview script missing (optional)${NC}"
        warnings=$((warnings+1))
    fi
else
    echo -e "${RED}ERROR: package.json not found${NC}"
    errors=$((errors+1))
fi

cd ..

# Summary
echo ""
echo "=========================================="
if [[ $errors -eq 0 ]]; then
    echo -e "${GREEN}READY TO DEPLOY!${NC}"
    echo "Errors: $errors"
    echo "Warnings: $warnings"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your code to GitHub"
    echo "2. Follow instructions in DEPLOYMENT.md"
    echo "3. Deploy to Railway"
    exit 0
else
    echo -e "${RED}NOT READY TO DEPLOY${NC}"
    echo "Errors: $errors"
    echo "Warnings: $warnings"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
