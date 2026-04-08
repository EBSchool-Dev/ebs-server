# EBS Server

Backend service for EBSN Online Campus, built with NestJS v11 + Fastify, Prisma, Zod, and PostgreSQL.

## Foundation Status

The Foundation Phase baseline is now in place:

- Fastify-first bootstrap in `src/main.ts`
- Global prefix: `/api/v1`
- Global `ZodValidationPipe` + `ZodSerializerInterceptor`
- Request ID hook and global exception filter
- Typed env validation with Zod in `src/common/config`
- Prisma 7 setup with `prisma.config.ts`
- Health endpoints:
  - `GET /api/v1/health`
  - `GET /api/v1/health/ready`
- Docker baseline in `docker/`

## Requirements

- Node.js 24.x
- npm 11+
- Docker + Docker Compose (for local infra)

## Environment

Copy `.env.example` and adjust values if needed:

```bash
cp .env.example .env
```

Key variables:

- `NODE_ENV`
- `APP_PORT` (host + container port for Docker, defaults to `3000`)
- `PORT`
- `DATABASE_URL`
- `DATABASE_READ_URL`
- `REDIS_URL`

## Install

```bash
npm install
```

## Run

```bash
# dev watch mode
npm run start:dev

# debug watch mode
npm run start:debug

# build + run compiled app
npm run build
npm run start:prod
```

## Quality Checks

```bash
# lint with autofix
npm run lint

# lint check only
npm run lint:check

# format + lint fix
npm run format:all
```

## Tests

```bash
# unit tests
npm test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Prisma

Prisma 7 is configured with `prisma.config.ts` (datasource URL is read there, not from `schema.prisma`).

```bash
# generate client
npx prisma generate
```

## Docker

```bash
# validate development compose file
docker compose -f docker/docker-compose.dev.yml config

# start local development stack (uses Dockerfile.dev + watch mode)
docker compose -f docker/docker-compose.dev.yml up --build

# start production-like stack (uses Dockerfile)
docker compose -f docker/docker-compose.prod.yml up --build
```

To run on another port (example `4001`):

```bash
APP_PORT=4001 docker compose -f docker/docker-compose.dev.yml up --build
```

## VS Code / Cursor Save Behavior

Workspace settings are configured so save runs ESLint fixes:

- `.vscode/settings.json` enables `source.fixAll.eslint`
- built-in organize imports on save is disabled to avoid conflict with `simple-import-sort`

If settings do not apply immediately, reload the editor window.
