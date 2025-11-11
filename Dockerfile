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

# Copy only the standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create empty /public to avoid copy errors (safe even if unused)
RUN mkdir -p ./public

EXPOSE 3000
ENV PORT=3000

# Start the Next.js standalone server
CMD ["node", "server.js"]
