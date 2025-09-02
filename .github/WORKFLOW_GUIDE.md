# GitHub Actions Workflow Guide

## CI Pipeline Overview

The CI pipeline (`ci.yml`) runs automatically on:
- **Push** to `main` or `deploy-finadv` branches
- **Pull Requests** to `main` or `deploy-finadv` branches

## Pipeline Jobs

### 1. 🏗️ Client Build & Test
- Installs Node.js dependencies
- Runs ESLint linting
- Builds React application
- Uploads build artifacts

### 2. 🔧 Server Build & Test  
- Installs Node.js dependencies
- Validates server.js syntax
- Ensures server can start properly

### 3. 🐳 Docker Build Test
- Tests Docker image builds for both client and server
- Uses Docker BuildKit for efficient caching
- Validates Dockerfile configurations

### 4. 🔒 Security Scan
- Runs `npm audit` on both client and server
- Checks for known vulnerabilities in dependencies
- Continues on error to not block the pipeline

### 5. 📝 Code Quality Check
- Runs ESLint on client code
- Searches for TODO/FIXME comments
- Reports code quality metrics

### 6. 📊 CI Summary
- Provides overall pipeline status
- Shows results of all jobs
- Indicates if ready for deployment

## Viewing Results

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "CI Pipeline" workflow
4. View individual job results and logs

## Status Badge

The README.md includes a status badge that shows:
- ✅ Green: All tests passing
- ❌ Red: Some tests failing
- 🟡 Yellow: Tests running

## Troubleshooting

### Common Issues:

1. **Linting Errors**: Fix ESLint issues in client code
2. **Build Failures**: Check package.json scripts and dependencies
3. **Docker Build Issues**: Ensure Dockerfiles are valid
4. **Security Vulnerabilities**: Update dependencies with `npm update`

### Debug Steps:

1. Check the specific failing job in GitHub Actions
2. Review the error logs in the job details
3. Run the same commands locally to reproduce
4. Fix issues and push again to re-trigger the pipeline
