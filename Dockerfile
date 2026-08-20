# Multi-stage build for a Vite React app deployed on Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Lightweight static file server for the built app
RUN npm install -g serve@14.2.4

COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Cloud Run provides PORT at runtime
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-8080}"]
