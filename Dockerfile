# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-alpine AS deps
LABEL stage=builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./

RUN corepack enable && \
  pnpm install --frozen-lockfile --prod=false

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:22-alpine AS builder
LABEL stage=builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN corepack enable && \
  pnpm build

# ============================================================
# Stage 3: Production
# ============================================================
FROM node:22-alpine AS runner
LABEL maintainer="bhw-pas-team"

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public

RUN mkdir -p .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
