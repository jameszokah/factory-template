# Production image: your UI + the Factory server, no Mastra Platform services.
FROM oven/bun:1.4 AS build
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY package.json bun.lock* ./
COPY apps/server/package.json apps/server/
COPY apps/ui/package.json apps/ui/
RUN bun install --frozen-lockfile
COPY . .
RUN node scripts/build.mjs

FROM node:22-bookworm-slim
# Agents need git (and whatever your repositories need to build and test) in the local sandbox.
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates openssh-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /repo/apps/server/.mastra/output ./
ENV NODE_ENV=production \
    PORT=4111 \
    MASTRACODE_UI_DIST=/app/factory \
    FACTORY_LOCAL_SANDBOX_ROOT=/data/sandboxes \
    MASTRA_TELEMETRY_DISABLED=1
RUN mkdir -p /data/sandboxes && chown -R node:node /data /app
USER node
EXPOSE 4111
CMD ["node", "index.mjs"]
