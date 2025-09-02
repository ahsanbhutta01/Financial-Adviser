#!/bin/bash

# GitHub Self-Hosted Runner Setup Script for Financial Adviser
# This script sets up a self-hosted runner on your server for CI/CD pipeline

set -e

echo "🚀 Setting up GitHub Self-Hosted Runner for Financial Adviser"
echo "============================================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   echo "Please run as a regular user with sudo privileges"
   exit 1
fi

# Check required tools
echo "📋 Checking required tools..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Run: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if user is in docker group
if ! groups $USER | grep &>/dev/null '\bdocker\b'; then
    echo "❌ User $USER is not in docker group"
    echo "Run: sudo usermod -aG docker $USER && newgrp docker"
    exit 1
fi

echo "✅ All required tools are available"

# Create runner directory
RUNNER_DIR="$HOME/actions-runner"
mkdir -p $RUNNER_DIR
cd $RUNNER_DIR

# Download GitHub Actions Runner
echo "📦 Downloading GitHub Actions Runner..."
RUNNER_VERSION="2.311.0"
curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
    https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Verify checksum
echo "🔐 Verifying checksum..."
echo "29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278  actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" | shasum -a 256 -c

# Extract runner
echo "📂 Extracting runner..."
tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Install dependencies
echo "📋 Installing dependencies..."
sudo ./bin/installdependencies.sh

echo ""
echo "✅ GitHub Actions Runner setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your GitHub repository: https://github.com/ahsanbhutta01/Financial-Adviser"
echo "2. Navigate to Settings > Actions > Runners"
echo "3. Click 'New self-hosted runner'"
echo "4. Copy the configuration command and run it in this directory: $RUNNER_DIR"
echo "5. When prompted, use these settings:"
echo "   - Runner name: financial-adviser-runner"
echo "   - Runner group: Default"
echo "   - Labels: self-hosted,linux,x64,financial-adviser"
echo ""
echo "📝 Example configuration command:"
echo "./config.sh --url https://github.com/ahsanbhutta01/Financial-Adviser --token YOUR_TOKEN"
echo ""
echo "🏃 To start the runner:"
echo "./run.sh"
echo ""
echo "🔄 To run as a service:"
echo "sudo ./svc.sh install"
echo "sudo ./svc.sh start"
