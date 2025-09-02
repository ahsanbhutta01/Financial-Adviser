#!/bin/bash

# Docker Hub Setup Script for Financial Adviser
# This script helps set up Docker Hub authentication

set -e

echo "🐳 Docker Hub Setup for Financial Adviser"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"

# Check if user is logged in to Docker Hub
if docker info | grep -q "Username:"; then
    CURRENT_USER=$(docker info 2>/dev/null | grep "Username:" | awk '{print $2}')
    echo "✅ Already logged in to Docker Hub as: $CURRENT_USER"
    echo ""
    read -p "Do you want to logout and login with different credentials? (y/N): " logout_choice
    if [[ $logout_choice =~ ^[Yy]$ ]]; then
        docker logout
        echo "✅ Logged out from Docker Hub"
    else
        echo "✅ Using existing Docker Hub login"
        exit 0
    fi
fi

echo ""
echo "🔐 Docker Hub Login"
echo "Please enter your Docker Hub credentials:"
echo "(Create account at https://hub.docker.com if you don't have one)"
echo ""

# Login to Docker Hub
if docker login; then
    echo ""
    echo "✅ Successfully logged in to Docker Hub!"
    
    # Get username
    USERNAME=$(docker info 2>/dev/null | grep "Username:" | awk '{print $2}')
    echo "   Username: $USERNAME"
    
    echo ""
    echo "🎯 Your images will be pushed to:"
    echo "   - docker.io/$USERNAME/financial-adviser-client"
    echo "   - docker.io/$USERNAME/financial-adviser-server"
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Update CI/CD pipeline to use your username"
    echo "2. Add DOCKERHUB_USERNAME and DOCKERHUB_TOKEN to GitHub Secrets"
    echo "3. Create access token at: https://hub.docker.com/settings/security"
    echo ""
    echo "💡 For CI/CD, use an access token instead of your password"
    echo "   GitHub Secrets needed:"
    echo "   - DOCKERHUB_USERNAME: $USERNAME"
    echo "   - DOCKERHUB_TOKEN: <your-access-token>"
    
else
    echo ""
    echo "❌ Docker Hub login failed"
    echo "Please check your credentials and try again"
    exit 1
fi

echo ""
echo "🚀 Docker Hub setup complete!"
