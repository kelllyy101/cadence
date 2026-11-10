# Debian slim (glibc) because librdkafka doesn't build reliably on Alpine (ADR-0004).
FROM node:22-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# Dev image for docker compose: full workspace, runs from TypeScript source.
FROM base AS dev
COPY . .
RUN pnpm install --frozen-lockfile && pnpm codegen
