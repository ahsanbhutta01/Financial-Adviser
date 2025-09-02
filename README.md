# Financial Adviser Application

[![CI Pipeline](https://github.com/ahsanbhutta01/Financial-Adviser/actions/workflows/ci.yml/badge.svg)](https://github.com/ahsanbhutta01/Financial-Adviser/actions/workflows/ci.yml)

A comprehensive financial advisory application built with React, Node.js, and MongoDB, fully containerized with Docker.

## 🚀 Features

- **Modern React Frontend**: Built with Vite and Tailwind CSS
- **Robust Node.js Backend**: Express.js API with MongoDB integration
- **Fully Dockerized**: Complete Docker Compose setup for easy deployment
- **CI/CD Pipeline**: Automated testing and building with GitHub Actions

## 🏗️ Architecture

- **Frontend**: React.js with Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Database**: MongoDB with Mongoose ODM
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/ahsanbhutta01/Financial-Adviser.git
cd Financial-Adviser
```

2. Create environment file:
```bash
cp server/.env.example server/.env
# Edit server/.env with your configuration
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- MongoDB: localhost:27017

## 🔧 Development

### Local Development Setup

**Client:**
```bash
cd client
npm install
npm run dev
```

**Server:**
```bash
cd server
npm install
npm run dev
```

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Server:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🧪 CI/CD Pipeline

Our GitHub Actions CI pipeline automatically:

1. **Build & Test Client**: Installs dependencies, runs linting, and builds React app
2. **Build & Test Server**: Installs dependencies and validates server code
3. **Docker Build Test**: Ensures Docker images build successfully
4. **Security Scan**: Runs npm audit for vulnerabilities
5. **Code Quality Check**: Runs linting and checks for TODO/FIXME comments

The pipeline runs on:
- Push to `main` or `deploy-finadv` branches
- Pull requests to `main` or `deploy-finadv` branches

## 📁 Project Structure

```
Financial-Adviser/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── redux/          # Redux store and slices
│   │   └── assets/         # Static assets
│   └── Dockerfile
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── Dockerfile
├── docker-compose.yaml    # Docker Compose configuration
└── .github/workflows/     # CI/CD workflows
```

## 🔒 Environment Variables

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://mongodb:27017/financial_advisor
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=8000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **Ahsan Bhutta** - [ahsanbhutta01](https://github.com/ahsanbhutta01)

---

⭐ Star this repository if you find it helpful!
