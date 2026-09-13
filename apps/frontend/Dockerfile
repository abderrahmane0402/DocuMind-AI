# Stage 1: Build Vite React App
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API base URL build argument (defaults to relative /api/v1 for reverse proxy)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]