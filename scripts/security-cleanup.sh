#!/bin/bash

# 🚨 SECURITY CLEANUP & GITHUB SECRETS SETUP
# Run this script to help clean up and set up secure environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 SECURITY ALERT: LEAKED SECRETS CLEANUP${NC}"
echo -e "${RED}========================================${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMMEDIATE ACTIONS REQUIRED:${NC}"
echo ""
echo -e "${RED}1. ROTATE ALL SECRETS:${NC}"
echo "   □ Google Cloud Console → Regenerate Gemini API key"
echo "   □ OpenRouter → Regenerate API key"
echo "   □ Google OAuth Console → Regenerate Client Secret"
echo "   □ Docker Hub → Regenerate access token"
echo ""

echo -e "${BLUE}2. GENERATE NEW SECURE SECRETS:${NC}"
echo ""
echo -e "${GREEN}# Generate new JWT secret:${NC}"
echo "openssl rand -hex 32"
echo ""
echo -e "${GREEN}# Generate new session secret:${NC}"
echo "openssl rand -hex 64"
echo ""

echo -e "${BLUE}3. GitHub Secrets to Add:${NC}"
echo ""
cat << 'EOF'
MONGO_URI=mongodb://mongodb:27017/financial_advisor
PORT=8000
SECRET_KEY=[use generated 32-char hex]
SESSION_SECRET=[use generated 64-char hex]
GEMINI_API=[new Gemini API key]
OPEN_ROUTER_API=[new OpenRouter key]
GOOGLE_CLIENT_ID=[new Google Client ID]
GOOGLE_CLIENT_SECRET=[new Google Client Secret]
CALLBACK_URL=http://localhost:8000/api/user/google/callback
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000
DOCKERHUB_USERNAME=[your Docker Hub username]
DOCKERHUB_TOKEN=[new Docker Hub token]
EOF

echo ""
echo -e "${BLUE}4. ADD TO GITHUB:${NC}"
echo "   Go to: https://github.com/ahsanbhutta01/Financial-Adviser/settings/secrets/actions"
echo "   Add each secret listed above"
echo ""

echo -e "${GREEN}5. VERIFICATION:${NC}"
echo "   □ All secrets rotated"
echo "   □ New secrets added to GitHub"
echo "   □ Local .env updated with placeholders"
echo "   □ Test deployment works"
echo ""

echo -e "${YELLOW}📋 Security cleanup completed in repository!${NC}"
echo -e "${YELLOW}🔄 Now rotate your secrets and add them to GitHub!${NC}"
