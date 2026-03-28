# syntax=docker/dockerfile:1

ARG PNPM_VERSION=10.19.0
FROM node:20-alpine AS base

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile

# Builder — full tree from deps only; COPY . . would replace packages/ without workspace node_modules and break e.g. tsc.
FROM base AS builder
COPY --from=deps /app /app
WORKDIR /app
RUN pnpm turbo build --filter=amb-web

# Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3333
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3333

CMD ["node", "apps/web/server.js"]
