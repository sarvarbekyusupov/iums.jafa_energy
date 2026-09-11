# Multi-stage build for React + Vite application

# Stage 1: Build
# Pinned: the floating node:20-alpine moved to a newer Alpine once already and broke the
# backend build with no code change on our side.
FROM node:20-alpine3.22 AS builder

# Build argument for API URL
ARG VITE_BASE_URL=https://jafaiums.uz

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
# 127.0.0.1, not localhost: Alpine resolves localhost to ::1 first and the nginx below
# listens on IPv4 only, so the check failed on a container that was serving fine.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
