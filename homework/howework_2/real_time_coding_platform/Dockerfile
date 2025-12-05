# Multi-stage Dockerfile for Real-Time Coding Platform

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Production image
FROM node:20-slim AS production

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/dist ./public

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
