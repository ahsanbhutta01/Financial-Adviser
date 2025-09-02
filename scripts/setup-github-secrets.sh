#!/bin/bash

# 🔐 GitHub Secrets Setup Helper Script for Financial Adviser
# This script helps you verify and set up environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 GitHub Secrets Setup Helper${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if GitHub CLI is installed
if command_exists gh; then
    echo -e "${GREEN}✅ GitHub CLI detected${NC}"
    
    # Check if user is logged in
    if gh auth status >/dev/null 2>&1; then
        echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
        
        echo -e "${YELLOW}🔍 Checking existing secrets...${NC}"
        
        # List current secrets
        echo -e "${BLUE}Current repository secrets:${NC}"
        gh secret list || echo -e "${YELLOW}⚠️  Could not list secrets${NC}"
        
        echo ""
        echo -e "${YELLOW}📝 To add missing secrets, use:${NC}"
        echo -e "${BLUE}gh secret set SECRET_NAME --body 'secret_value'${NC}"
        echo ""
        
    else
        echo -e "${YELLOW}⚠️  GitHub CLI not authenticated${NC}"
        echo -e "${BLUE}Run: gh auth login${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not installed${NC}"
    echo -e "${BLUE}Install: https://cli.github.com/${NC}"
fi

echo -e "${BLUE}📋 Required Secrets Checklist:${NC}"
echo "□ MONGO_URI"
echo "□ PORT" 
echo "□ SECRET_KEY"
echo "□ GEMINI_API"
echo "□ OPEN_ROUTER_API"
echo "□ GOOGLE_CLIENT_ID"
echo "□ GOOGLE_CLIENT_SECRET"
echo "□ CALLBACK_URL"
echo "□ FRONTEND_URL"
echo "□ SESSION_SECRET"
echo "□ DOCKERHUB_USERNAME"
echo "□ DOCKERHUB_TOKEN"

echo ""
echo -e "${BLUE}🌐 Manual Setup:${NC}"
echo "1. Go to: https://github.com/ahsanbhutta01/Financial-Adviser/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret from the list above"
echo "4. See GITHUB_SECRETS_SETUP.md for values"

echo ""
echo -e "${GREEN}📖 For detailed setup guide, see: GITHUB_SECRETS_SETUP.md${NC}"

# Check if local .env exists
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✅ Local server/.env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Local server/.env file not found${NC}"
    echo -e "${BLUE}Copy server/.env.template to server/.env and fill in values${NC}"
fi

# Test production compose file
if [ -f "docker-compose.prod.yml" ]; then
    echo -e "${GREEN}✅ Production compose file exists${NC}"
    
    # Check if it uses environment variables
    if grep -q "MONGO_URI=" docker-compose.prod.yml; then
        echo -e "${GREEN}✅ Production compose uses environment variables${NC}"
    else
        echo -e "${YELLOW}⚠️  Production compose might still use env_file${NC}"
    fi
else
    echo -e "${RED}❌ Production compose file missing${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Ready for GitHub Secrets setup!${NC}"
