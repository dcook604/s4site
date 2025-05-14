FROM node:18-slim AS deps
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
ENV HOME=/app
COPY package.json package-lock.json* ./
# Copy Prisma schema before running npm ci to ensure prisma generate works
COPY prisma ./prisma/
RUN npm ci

FROM node:18-slim AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
ENV HOME=/app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client is already generated in the deps stage
# Just build the Next.js application
RUN npm run build

FROM node:18-slim AS runner
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
ENV HOME=/app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Leverage the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create uploads directory
RUN mkdir -p ./public/uploads/pdfs && \
    chown -R nextjs:nodejs ./public/uploads

# Clean up .npm cache to avoid root-owned files
RUN rm -rf /app/.npm

# Set npm cache to a writable directory
ENV npm_config_cache=/tmp/.npm

# Switch to the nextjs user
USER nextjs

EXPOSE 3000

ENV PORT 3000

# Create SQLite database on first run
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"] 