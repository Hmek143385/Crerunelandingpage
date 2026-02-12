#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[v0] Starting GitHub push...${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}[v0] ERROR: Not a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}[v0] Current branch: $CURRENT_BRANCH${NC}"

# Add all changes
echo -e "${YELLOW}[v0] Adding all changes...${NC}"
git add -A

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}[v0] No changes to commit${NC}"
    exit 0
fi

# Show what will be committed
echo -e "${YELLOW}[v0] Changes to be committed:${NC}"
git diff --cached --name-only

# Commit changes
COMMIT_MESSAGE="[v0] Fix Supabase errors: Direct DB queries instead of Edge Functions"
echo -e "${YELLOW}[v0] Committing: $COMMIT_MESSAGE${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
echo -e "${YELLOW}[v0] Pushing to GitHub ($CURRENT_BRANCH)...${NC}"
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[v0] SUCCESS! All changes pushed to GitHub${NC}"
    echo -e "${GREEN}[v0] Branch: $CURRENT_BRANCH${NC}"
    echo -e "${GREEN}[v0] Repository: https://github.com/investassur/Crerunelandingpage${NC}"
else
    echo -e "${RED}[v0] ERROR: Push failed${NC}"
    exit 1
fi
