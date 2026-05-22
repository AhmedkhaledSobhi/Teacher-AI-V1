# Optimized lightweight Dockerfile for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./

# Copy necessary files for postinstall scripts
COPY src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY src/assets/iconify-icons/bundle-icons-css.ts ./src/assets/iconify-icons/bundle-icons-css.ts
RUN npm ci
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage with distroless image for maximum security and minimal size
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

# Copy Prisma files
COPY --from=builder --chown=nonroot:nonroot /app/src/prisma ./src/prisma
COPY --from=builder --chown=nonroot:nonroot /app/node_modules/.prisma ./node_modules/.prisma

USER nonroot

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["server.js"]
