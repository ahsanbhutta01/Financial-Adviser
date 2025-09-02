# 📋 Environment Variables List for Financial Adviser

## 🖥️ **Server Variables (Backend)**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URI` | ✅ | MongoDB connection string | `mongodb://mongodb:27017/financial_advisor` |
| `PORT` | ✅ | Server port | `8000` |
| `SECRET_KEY` | ✅ | JWT signing secret | `your_jwt_secret_here` |
| `SESSION_SECRET` | ✅ | Express session secret | `your_session_secret_here` |
| `GEMINI_API` | ✅ | Google Gemini API key | `your_gemini_api_key_here` |
| `OPEN_ROUTER_API` | ✅ | OpenRouter API key | `your_openrouter_api_key_here` |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID | `your_google_client_id_here` |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret | `your_google_client_secret_here` |
| `CALLBACK_URL` | ✅ | OAuth callback URL | `http://localhost:8000/api/user/google/callback` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | ✅ | Environment mode | `production` |

## 🌐 **Client Variables (Frontend - Vite)**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | Backend API URL | `http://localhost:8000` |
| `VITE_APP_NAME` | ❌ | Application name | `Financial Adviser` |

## 🐳 **Docker/CI Variables**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DOCKERHUB_USERNAME` | ✅ | Docker Hub username | `your_dockerhub_username` |
| `DOCKERHUB_TOKEN` | ✅ | Docker Hub access token | `your_dockerhub_token_here` |

## 🔧 **Variable Generation Commands:**

```bash
# Generate secure JWT secret (32 bytes)
openssl rand -hex 32

# Generate secure session secret (64 bytes)  
openssl rand -hex 64

# Generate random string (16 bytes)
openssl rand -hex 16
```

## 📝 **GitHub Secrets Checklist:**

Copy this list for GitHub Secrets setup:

```
MONGO_URI
PORT
SECRET_KEY
SESSION_SECRET
GEMINI_API
OPEN_ROUTER_API
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
CALLBACK_URL
FRONTEND_URL
VITE_API_BASE_URL
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```
