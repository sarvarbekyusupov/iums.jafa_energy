# Multi-stage build for React + Vite application

# Stage 1: Build
FROM node:20-alpine AS builder

# Build argument for API URL
ARG VITE_BASE_URL=http://3.121.174.54:3000

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with environment variable
ENV VITE_BASE_URL=${VITE_BASE_URL}
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
