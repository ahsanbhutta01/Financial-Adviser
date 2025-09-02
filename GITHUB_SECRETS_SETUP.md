# 🔐 GitHub Secrets Setup Guide for Financial Adviser

## 📋 **Required GitHub Secrets**

You need to add these secrets to your GitHub repository:

### **Navigation Path:**
```
Your Repository → Settings → Secrets and variables → Actions → New repository secret
```

### **Secrets to Add:**

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `MONGO_URI` | `mongodb://mongodb:27017/financial_advisor` | MongoDB connection string |
| `PORT` | `8000` | Server port |
| `SECRET_KEY` | `your_jwt_secret_here` | JWT secret (generate secure value) |
| `GEMINI_API` | `your_gemini_api_key_here` | Google Gemini API key |
| `OPEN_ROUTER_API` | `your_openrouter_api_key_here` | OpenRouter API key |
| `GOOGLE_CLIENT_ID` | `your_google_client_id_here` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `your_google_client_secret_here` | Google OAuth Client Secret |
| `CALLBACK_URL` | `http://localhost:8000/api/user/google/callback` | OAuth callback URL |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL |
| `SESSION_SECRET` | `your_session_secret_here` | Session secret (generate secure value) |
| `DOCKERHUB_USERNAME` | `your_dockerhub_username` | Docker Hub username |
| `DOCKERHUB_TOKEN` | `your_dockerhub_token_here` | Docker Hub access token |

## 🚀 **Step-by-Step Setup:**

### 1. **Open GitHub Repository**
- Go to: `https://github.com/ahsanbhutta01/Financial-Adviser`

### 2. **Navigate to Secrets**
- Click **Settings** tab
- In left sidebar: **Secrets and variables** → **Actions**

### 3. **Add Each Secret**
For each secret above:
- Click **"New repository secret"**
- Enter **Name** (exactly as shown in table)
- Enter **Secret** (the corresponding value)
- Click **"Add secret"**

## 🔧 **Production Recommendations:**

### **Security Updates Needed:**
1. **Generate stronger secrets:**
   ```bash
   # Generate secure SECRET_KEY
   openssl rand -hex 32
   
   # Generate secure SESSION_SECRET  
   openssl rand -hex 64
   ```

2. **Update CALLBACK_URL for production:**
   ```
   # Development
   CALLBACK_URL=http://localhost:8000/api/user/google/callback
   
   # Production (replace with your domain)
   CALLBACK_URL=https://yourdomain.com/api/user/google/callback
   ```

3. **Update FRONTEND_URL for production:**
   ```
   # Development
   FRONTEND_URL=http://localhost:5173
   
   # Production (replace with your domain)
   FRONTEND_URL=https://yourdomain.com
   ```

## ✅ **Verification:**

After adding all secrets, your GitHub Actions should have access to:
- ✅ All environment variables for server
- ✅ Docker Hub credentials for deployment
- ✅ Secure secret management

## 🐳 **Docker Compose Update:**

The `docker-compose.prod.yml` has been updated to use environment variables:
- ❌ **Old**: `env_file: - server/.env`
- ✅ **New**: `environment:` section with `${VARIABLE_NAME}` syntax

## 🚀 **Next Steps:**

1. Add all secrets to GitHub (as listed above)
2. Push code to trigger CI/CD pipeline
3. Verify deployment works without `.env` file errors
4. Update secrets to more secure values for production

## 🔍 **Common Issues:**

- **Secret names must match exactly** (case-sensitive)
- **No spaces in secret names**
- **Values should not have quotes unless needed**
- **Docker Hub token must have proper permissions**
