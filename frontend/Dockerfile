# Frontend Dockerfile
# Multi-stage build: stage 1 compiles the React app, stage 2 serves it with Nginx.

# ---------------------------------------------------------------------------
# Stage 1 — build
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — serve
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine

# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our Nginx config (forwards /api/* to the Django backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
