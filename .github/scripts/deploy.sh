#!/bin/bash

# Manual Deployment Script for Financial Adviser
# Use this script to deploy manually when needed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="ahsanbhutta01"
IMAGE_TAG=${1:-"deploy-finadv"}  # Use provided tag or default
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}🚀 Financial Adviser - Manual Deployment Script${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}Using image tag: ${IMAGE_TAG}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    if ! docker compose version >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    else
        # Use docker compose (new format)
        DOCKER_COMPOSE_CMD="docker compose"
    fi
else
    # Use docker-compose (legacy format)
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
if [ -f "$COMPOSE_FILE" ]; then
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down --remove-orphans || true
else
    # Fallback: stop containers by name
    docker stop financial-adviser-client-prod financial-adviser-server-prod financial-adviser-mongodb-prod 2>/dev/null || true
    docker rm financial-adviser-client-prod financial-adviser-server-prod financial-adviser-mongodb-prod 2>/dev/null || true
fi

# Clean up unused images and containers
echo -e "${BLUE}🧹 Cleaning up unused resources...${NC}"
docker system prune -f || true

# Create production docker-compose file
echo -e "${BLUE}📝 Creating production docker-compose file...${NC}"
cat > $COMPOSE_FILE << EOF
version: '3.8'

services:
  client:
    image: ${REGISTRY}/${REPO_OWNER}/financial-adviser-client:${IMAGE_TAG}
    container_name: financial-adviser-client-prod
    ports:
      - "5173:80"
    depends_on:
      - server
    networks:
      - app-network
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  server:
    image: ${REGISTRY}/${REPO_OWNER}/financial-adviser-server:${IMAGE_TAG}
    container_name: financial-adviser-server-prod
    ports:
      - "8000:8000"
    env_file: 
      - server/.env   
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:7-jammy
    container_name: financial-adviser-mongodb-prod
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data_prod:/data/db
      - ./backups:/backups
    networks:
      - app-network
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=financial_advisor
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data_prod:
    external: false
EOF

echo -e "${GREEN}✅ Production compose file created${NC}"

# Pull latest images
echo -e "${BLUE}📦 Pulling latest images...${NC}"
docker pull ${REGISTRY}/${REPO_OWNER}/financial-adviser-client:${IMAGE_TAG} || {
    echo -e "${RED}❌ Failed to pull client image${NC}"
    echo -e "${YELLOW}Make sure you're logged in: docker login ${REGISTRY}${NC}"
    exit 1
}

docker pull ${REGISTRY}/${REPO_OWNER}/financial-adviser-server:${IMAGE_TAG} || {
    echo -e "${RED}❌ Failed to pull server image${NC}"
    exit 1
}

echo -e "${GREEN}✅ Images pulled successfully${NC}"

# Deploy application
echo -e "${BLUE}🚀 Deploying application...${NC}"
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d

# Wait for services
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Health checks
echo -e "${BLUE}🏥 Performing health checks...${NC}"

# Check containers
echo -e "${BLUE}Checking container status...${NC}"
if ! docker ps | grep -q "financial-adviser-client-prod"; then
    echo -e "${RED}❌ Client container is not running${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs client
    exit 1
fi

if ! docker ps | grep -q "financial-adviser-server-prod"; then
    echo -e "${RED}❌ Server container is not running${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs server
    exit 1
fi

if ! docker ps | grep -q "financial-adviser-mongodb-prod"; then
    echo -e "${RED}❌ MongoDB container is not running${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs mongodb
    exit 1
fi

echo -e "${GREEN}✅ All containers are running${NC}"

# Test API
echo -e "${BLUE}Testing API endpoint...${NC}"
max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:8000/api/health 2>/dev/null; then
        echo -e "${GREEN}✅ API health check passed${NC}"
        break
    else
        echo -e "${YELLOW}⏳ API not ready yet, attempt $((attempt + 1))/$max_attempts${NC}"
        sleep 10
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ API health check failed after $max_attempts attempts${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs server
    exit 1
fi

# Test frontend
echo -e "${BLUE}Testing frontend...${NC}"
if curl -f http://localhost:5173 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs client
    exit 1
fi

# Show final status
echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep financial-adviser
echo ""
echo -e "${BLUE}🔗 Application URLs:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "   API Health: ${GREEN}http://localhost:8000/api/health${NC}"
echo -e "   MongoDB: ${GREEN}localhost:27017${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "   View logs: ${YELLOW}$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f${NC}"
echo -e "   Stop app: ${YELLOW}$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down${NC}"
echo -e "   Restart: ${YELLOW}$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE restart${NC}"
echo ""
echo -e "${GREEN}✨ Financial Adviser is now running in production mode!${NC}"
