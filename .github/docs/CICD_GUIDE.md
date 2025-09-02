# Financial Adviser - CI/CD Pipeline Documentation

## Overview
Complete CI/CD pipeline for the Financial Adviser application with automatic build, test, and deployment capabilities.

## 🏗️ Pipeline Architecture

### CI (Continuous Integration)
1. **Client Build** - React app build and linting
2. **Server Build** - Node.js app build and syntax check
3. **Docker Build & Push** - Build and push Docker images to GitHub Container Registry
4. **Security Scan** - npm audit for vulnerabilities
5. **Code Quality** - ESLint and code standards check

### CD (Continuous Deployment)
6. **Deploy** - Automatic deployment with container management
7. **Health Checks** - Verify all services are running properly
8. **Summary** - Complete pipeline status report

## 🚀 Features

### Automatic Container Management
- **Stop Old Containers**: Automatically stops existing containers
- **Pull Latest Images**: Downloads newest Docker images
- **Deploy New Containers**: Starts fresh containers with latest code
- **Health Monitoring**: Verifies all services are healthy
- **Rollback Ready**: Easy rollback if deployment fails

### Image Registry
- **GitHub Container Registry (GHCR)**: Stores Docker images
- **Automatic Tagging**: Images tagged with branch name and SHA
- **Cache Optimization**: BuildKit caching for faster builds

### Environment Management
- **Production Environment**: Dedicated production deployment
- **Environment Variables**: Secure handling of secrets
- **Database Persistence**: MongoDB data preserved across deployments

## 📋 Prerequisites

### GitHub Repository Setup
1. Enable GitHub Container Registry
2. Set up repository secrets (if needed)
3. Configure branch protection rules

### Server Requirements
- Docker & Docker Compose installed
- GitHub Actions Runner (for self-hosted deployment)
- Network access to GitHub Container Registry

## 🔧 Configuration

### Triggered Events
- **Push to main**: Full CI/CD pipeline
- **Push to deploy-finadv**: Full CI/CD pipeline
- **Pull Requests**: CI only (no deployment)

### Environment Variables
```yaml
REGISTRY: ghcr.io
IMAGE_NAME_CLIENT: ahsanbhutta01/financial-adviser-client
IMAGE_NAME_SERVER: ahsanbhutta01/financial-adviser-server
```

## 📦 Docker Images

### Client Image
- **Base**: Multi-stage build (Node.js → nginx)
- **Registry**: `ghcr.io/ahsanbhutta01/financial-adviser-client`
- **Tags**: `main`, `deploy-finadv`, `sha-<commit>`

### Server Image
- **Base**: Node.js Alpine
- **Registry**: `ghcr.io/ahsanbhutta01/financial-adviser-server`
- **Tags**: `main`, `deploy-finadv`, `sha-<commit>`

## 🏥 Health Checks

### API Health Endpoint
```
GET /api/health
Response: {
  "status": "OK",
  "message": "Financial Adviser API is running",
  "timestamp": "2025-09-02T...",
  "uptime": 123.45
}
```

### Container Health Checks
- **Frontend**: HTTP check on port 80
- **Backend**: API health endpoint check
- **Database**: MongoDB ping command

## 🚀 Deployment Process

### Automatic (GitHub Actions)
1. Code pushed to main/deploy-finadv
2. CI pipeline runs (build, test, lint)
3. Docker images built and pushed
4. Production deployment triggered
5. Old containers stopped
6. New containers started
7. Health checks performed
8. Success/failure reported

### Manual Deployment
```bash
# Using deployment script
./.github/scripts/deploy.sh [tag]

# Or using Docker Compose directly
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Container Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Application URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/health
- **MongoDB**: localhost:27017

### Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f server
```

## 🔄 Rollback Process

### Quick Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Deploy previous version
./.github/scripts/deploy.sh sha-<previous-commit>
```

### Emergency Rollback
```bash
# Use previous working containers
docker stop financial-adviser-client-prod financial-adviser-server-prod
docker start <previous-container-id>
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Image Pull Failed
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

#### 2. Health Check Failed
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs server

# Check API manually
curl http://localhost:8000/api/health
```

#### 3. Database Connection Issues
```bash
# Check MongoDB container
docker-compose -f docker-compose.prod.yml logs mongodb

# Test database connection
docker exec -it financial-adviser-mongodb-prod mongosh
```

### Debug Commands
```bash
# Container inspection
docker inspect financial-adviser-server-prod

# Network inspection
docker network ls
docker network inspect financial-adviser_app-network

# Volume inspection
docker volume ls
docker volume inspect financial-adviser_mongodb_data_prod
```

## 📈 Pipeline Metrics

### Build Times (Typical)
- Client Build: ~2-3 minutes
- Server Build: ~1 minute
- Docker Build: ~3-5 minutes
- Total Pipeline: ~6-10 minutes

### Success Criteria
- ✅ All tests pass
- ✅ No linting errors
- ✅ Security scan passes
- ✅ Docker builds successful
- ✅ Health checks pass
- ✅ All containers running

## 🔒 Security

### Image Security
- Multi-stage builds (smaller attack surface)
- Non-root user in containers
- Regular base image updates
- npm audit for vulnerabilities

### Secrets Management
- GitHub Secrets for sensitive data
- Environment files for configuration
- No hardcoded credentials

## 📝 Best Practices

### Code Quality
- ESLint with zero warnings policy
- Automated testing on every push
- Code review for all changes
- Branch protection rules

### Deployment Safety
- Health checks before marking success
- Automatic rollback on failure
- Database backup before deployment
- Monitoring and alerting

## 🔧 Customization

### Adding New Environments
1. Create new compose file: `docker-compose.staging.yml`
2. Add staging job to pipeline
3. Configure environment-specific secrets
4. Update deployment script

### Adding Tests
1. Add test job to pipeline
2. Configure test database
3. Add test scripts to package.json
4. Update health checks

### Performance Optimization
- Enable Docker BuildKit caching
- Use multi-stage builds
- Optimize image layers
- Implement CDN for static assets

## 📞 Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Review container logs
3. Verify environment configuration
4. Test deployment script manually

## 🔄 Updates

To update the pipeline:
1. Modify `.github/workflows/ci.yml`
2. Test changes on feature branch
3. Review and merge to main
4. Monitor first deployment
