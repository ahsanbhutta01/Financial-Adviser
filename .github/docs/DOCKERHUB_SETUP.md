# Docker Hub Setup Guide

## 🐳 Setting up Docker Hub for CI/CD

### 1. Create Docker Hub Account
1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up or log in
3. Note your username (e.g., `ahsanbhutta01`)

### 2. Create Access Token
1. Go to **Account Settings** → **Security**
2. Click **New Access Token**
3. Name: `financial-adviser-cicd`
4. Permissions: **Read, Write, Delete**
5. Copy the token (you won't see it again!)

### 3. Add GitHub Secrets
Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add these secrets:
- **Name**: `DOCKERHUB_USERNAME`
  **Value**: `ahsanbhutta01` (your Docker Hub username)

- **Name**: `DOCKERHUB_TOKEN`
  **Value**: `your-access-token-here` (the token you copied)

### 4. Repository Names
Your images will be pushed to:
- `docker.io/ahsanbhutta01/financial-adviser-client`
- `docker.io/ahsanbhutta01/financial-adviser-server`

### 5. Manual Docker Login (for local testing)
```bash
docker login
# Enter your Docker Hub username and password/token
```

### 6. Verify Setup
After pushing your code, check:
1. GitHub Actions should show successful builds
2. Docker Hub should show your new repositories
3. Images should be tagged with branch names

### 🔍 Troubleshooting

#### Authentication Failed
- Check DOCKERHUB_USERNAME matches exactly
- Regenerate DOCKERHUB_TOKEN if needed
- Ensure token has Read/Write permissions

#### Repository Not Found
- Docker Hub repositories are created automatically on first push
- Make sure username is correct in image names

#### Rate Limiting
- Docker Hub has pull rate limits for anonymous users
- Authenticated pushes have higher limits
- Consider Docker Hub Pro for unlimited pulls

### 📊 Docker Hub vs GitHub Container Registry

| Feature | Docker Hub | GitHub Container Registry |
|---------|------------|---------------------------|
| **Free Pulls** | 200/6h anonymous, unlimited authenticated | Unlimited |
| **Private Repos** | 1 free | Unlimited |
| **Integration** | Universal | GitHub-native |
| **Build Minutes** | Not included | Included with GitHub |
| **CDN** | Global | Global |

### 🎯 Benefits of Docker Hub
- ✅ Most popular container registry
- ✅ Better for public open-source projects
- ✅ Universal compatibility
- ✅ Established ecosystem
- ✅ Good documentation and community

### 🔗 Useful Links
- [Docker Hub](https://hub.docker.com)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Access Tokens Guide](https://docs.docker.com/docker-hub/access-tokens/)
