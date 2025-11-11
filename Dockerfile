# ---------- STAGE 1: Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# ---------- STAGE 2: Runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

# Start the Next.js app
CMD ["npm", "start"]
