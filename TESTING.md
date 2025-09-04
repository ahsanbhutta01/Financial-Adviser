# 🧪 Local Testing Guide

## 🚀 Quick Start (Docker Compose - Recommended)

### Prerequisites
- Docker installed and running
- Docker Compose installed

### 1. Set up environment variables

Create a `.env` file in the `server` directory:

```bash
# Copy the example environment file
cp server/.env.example server/.env
```

### 2. Start the entire application

```bash
# Build and start all services (frontend, backend, database)
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access your application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/health
- **MongoDB**: localhost:27017

### 4. Stop the application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 🛠️ Development Mode (Without Docker)

### Prerequisites
- Node.js 20+ installed
- MongoDB running locally or MongoDB Atlas account

### 1. Set up Backend

```bash
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the server
npm run dev
```

### 2. Set up Frontend (in another terminal)

```bash
cd client
npm install

# Start the React development server
npm run dev
```

### 3. Access your application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

---

## 🧪 Testing Individual Components

### Test Backend Only

```bash
cd server
npm install
npm start

# Test API endpoints
curl http://localhost:8000/api/health
```

### Test Frontend Only

```bash
cd client
npm install
npm run dev
```

### Build Production Versions

```bash
# Build frontend
cd client
npm run build

# Build Docker images
docker build -t financial-adviser-client ./client
docker build -t financial-adviser-server ./server
```

---

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 5173 or 8000
lsof -i :5173
lsof -i :8000

# Kill processes if needed
sudo kill -9 <PID>
```

**Docker issues:**
```bash
# Clean up Docker
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Database connection:**
```bash
# Check MongoDB is running
docker ps | grep mongo

# View logs
docker-compose logs mongodb
docker-compose logs server
```

### Reset Everything

```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker rmi $(docker images -q)

# Start fresh
docker-compose up --build
```

---

## 📝 Development Workflow

1. **Make changes** to your code
2. **Test locally** using one of the methods above
3. **Commit changes** to git
4. **Push to `deploy-finadv`** branch
5. **CI pipeline** will automatically build and test
6. **Use CI-built images** for deployment

---

## 🎯 What to Test

### ✅ Functionality Tests
- [ ] Homepage loads correctly
- [ ] Google OAuth login works
- [ ] Chat interface functions
- [ ] AI responses work
- [ ] User authentication persists
- [ ] API endpoints respond correctly

### ✅ Technical Tests
- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Database connects successfully
- [ ] Docker images build correctly
- [ ] All dependencies install properly

### ✅ Integration Tests
- [ ] Frontend communicates with backend
- [ ] Backend communicates with database
- [ ] Authentication flow works end-to-end
- [ ] All API routes work as expected
