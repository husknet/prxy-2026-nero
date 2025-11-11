# ---------- STAGE 1: Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- STAGE 2: Runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the full standalone build
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static

RUN mkdir -p ./standalone/public

# 🔥 Change port from 3000 → 8080
EXPOSE 8080
ENV PORT=8080

# Start the server
CMD ["node", "standalone/server.js"]
