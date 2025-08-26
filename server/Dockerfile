FROM node:20-alpine AS builder

WORKDIR /app

# Add build tools (required for bcrypt compilation)
RUN apk add --no-cache python3 make g++ git

COPY package*.json ./

# Install dependencies inside Docker
RUN npm install

# Copy rest of the app
COPY . .

# Rebuild bcrypt inside the container
RUN npm rebuild bcrypt --build-from-source

# --- Final production image ---
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "server.js"]