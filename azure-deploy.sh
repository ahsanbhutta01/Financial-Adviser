#!/bin/bash

# Azure Deployment Script for Financial Adviser App
# This script creates all necessary Azure resources for deploying the Financial Adviser application

set -e

# Configuration
RESOURCE_GROUP="financial-adviser-app-rg"
LOCATION="southeastasia"
APP_SERVICE_PLAN="financial-adviser-plan"
WEB_APP_NAME="financial-adviser-hassan-app"
DOCKER_COMPOSE_FILE="./docker-compose.yml"

echo "🚀 Starting Azure deployment for Financial Adviser App"
echo "======================================================"

# Step 1: Create Resource Group
echo "📁 Creating Resource Group: $RESOURCE_GROUP"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Step 2: Create App Service Plan (Free tier for development)
echo "🏗️  Creating App Service Plan: $APP_SERVICE_PLAN"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Step 3: Create Web App with container support
echo "🌐 Creating Web App: $WEB_APP_NAME"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEB_APP_NAME \
  --deployment-container-image-name nginx:latest

# Step 4: Configure the web app for multi-container
echo "🐳 Configuring multi-container deployment"
az webapp config container set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --multicontainer-config-type compose \
  --multicontainer-config-file $DOCKER_COMPOSE_FILE

# Step 5: Configure app settings
echo "⚙️  Configuring app settings"
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    DOCKER_REGISTRY_SERVER_URL=https://index.docker.io/v1/ \
    WEBSITES_PORT=5173

echo "✅ Azure resources created successfully!"
echo "🌍 Your app will be available at: https://$WEB_APP_NAME.azurewebsites.net"
echo ""
echo "📝 Next steps:"
echo "1. Update your GitHub Actions workflow"
echo "2. Set up deployment credentials"
echo "3. Configure environment variables"
