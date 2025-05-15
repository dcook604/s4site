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

# Generate Prisma client and build the Next.js application
RUN npx prisma generate && npm run build
# Compile the seed script to JavaScript
RUN npx tsc prisma/seed.ts --outDir prisma --esModuleInterop

FROM node:18-slim AS runner
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
ENV HOME=/tmp
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories with correct permissions
RUN mkdir -p /app/prisma /app/public/uploads/pdfs && \
    chown -R nextjs:nodejs /app/prisma /app/public/uploads && \
    chmod -R 755 /app/prisma /app/public/uploads

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove any root-owned .npm directory
RUN rm -rf /app/.npm

# Set npm cache to a writable directory
ENV npm_config_cache=/tmp/.npm
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Create volume for SQLite database and ensure permissions
VOLUME ["/app/prisma"]
RUN chown -R nextjs:nodejs /app/prisma && \
    chmod -R 755 /app/prisma

USER nextjs

EXPOSE 3313
ENV PORT 3313

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3313/api/health || exit 1

# Start the application with proper error handling and database initialization
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node server.js"] 