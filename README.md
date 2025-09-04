# Financial Adviser 💰

A full-stack financial advisory application built with React, Node.js, and AI-powered trading insights.

## 🏗️ Architecture

**Frontend:** React 19 + Vite + Tailwind CSS + Redux Toolkit  
**Backend:** Node.js + Express + MongoDB + Passport.js  
**Authentication:** Google OAuth + JWT  
**CI Pipeline:** Docker + GitHub Actions  

## 🔄 CI Pipeline

This project uses a **Continuous Integration only** approach:

- ✅ **Automated Testing** - Client and server testing on every push
- ✅ **Code Quality** - ESLint, security audits, and quality checks  
- ✅ **Docker Build** - Automated Docker image building and pushing
- ✅ **Security Scanning** - Dependency vulnerability scanning
- 🚫 **No Deployment** - Images are available for manual use

### CI Workflow
1. **Trigger:** Push to `deploy-finadv` branch
2. **Build & Test:** Frontend and backend build with quality checks
3. **Docker Images:** Built and pushed to Docker Hub
4. **Complete:** Images are ready for use with any deployment method

**Docker Images:**
- `hassan915/financial-adviser-client:deploy-finadv`
- `hassan915/financial-adviser-server:deploy-finadv`

## 🚀 Quick Start

### Development
```bash
# Clone the repository
git clone https://github.com/ahsanbhutta01/Financial-Adviser.git
cd Financial-Adviser

# Start with Docker Compose
docker-compose up -d

# Or run separately
# Frontend
cd client && npm install && npm run dev

# Backend  
cd server && npm install && npm run dev
```

### Production Use
The Docker images are automatically built and available on Docker Hub:
- `hassan915/financial-adviser-client:deploy-finadv`
- `hassan915/financial-adviser-server:deploy-finadv`

Use these images with your preferred deployment method (Docker Compose, Kubernetes, Cloud Services, etc.).

## 🔧 Environment Variables

**Server (.env):**
```
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/financial_advisor
JWT_SECRET=your-jwt-secret
SECRET_KEY=your-secret-key
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:8000/api/user/google/callback
FRONTEND_URL=http://localhost:5173
```

**Client (.env):**
```
VITE_API_URL=http://localhost:8000/api
```

## 🎯 Features

- 🔐 **Google OAuth Authentication**
- 💬 **AI-Powered Chat Interface**
- 📊 **Financial Trading Advice** 
- 📱 **Responsive Design**
- 🔒 **Secure JWT Sessions**
- 📈 **Conversation History**
- 🎨 **Modern UI/UX**

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Vite
- Tailwind CSS for styling
- Redux Toolkit + RTK Query
- React Router for navigation
- React Hot Toast for notifications

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Passport.js for OAuth
- JWT for authentication
- Express session management

**DevOps:**
- Docker & Docker Compose
- GitHub Actions CI
- ESLint & Security Auditing
- Multi-stage Docker builds

## 📁 Project Structure

```
Financial-Adviser/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── redux/         # State management
│   │   └── assets/        # Static assets
│   ├── Dockerfile
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & other middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/     # CI pipeline
├── docker-compose.yml     # Local development
└── README.md             # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Docker Hub:** [hassan915/financial-adviser](https://hub.docker.com/u/hassan915)
- **Issues:** [GitHub Issues](https://github.com/ahsanbhutta01/Financial-Adviser/issues)
