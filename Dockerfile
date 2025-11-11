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

# Some projects don’t have /public; create it just in case
RUN mkdir -p ./standalone/public

EXPOSE 3000
ENV PORT=3000

# Run Next.js’s built-in standalone server from the correct path
CMD ["node", "standalone/server.js"]
