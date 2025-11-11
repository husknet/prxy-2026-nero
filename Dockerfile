# ---------- STAGE 1: Builder ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Build Next.js project
RUN npm run build

# ---------- STAGE 2: Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules

# Expose default Next.js port
EXPOSE 3000

# Define environment
ENV NODE_ENV=production

# Start Next.js
CMD ["npm", "start"]
