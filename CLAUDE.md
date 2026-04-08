# CLAUDE.md — EBSN Online Campus Backend

> **This file is the single source of truth for AI-assisted development.**
> Read this file completely before writing any code. Follow every convention exactly.
> When implementing any feature, **always fetch the linked docs** to use the latest API patterns.

---

## Project Summary

EBSN Online Campus is a Learning Management System (LMS) for the Nigerian educational market. The backend is a **modular monolith** built with NestJS + Fastify, deployed via **Coolify** on **Digital Ocean**.

The system serves a three-tier learning hierarchy: **Course → Module → Lesson**, with quiz assessments, Paystack-powered course payments, automated PDF certificate generation, and a public certificate verification system.

---

## Tech Stack (Exact Versions)

| Layer | Technology | Version / Notes | Docs |
|---|---|---|---|
| Runtime | Node.js | 24 LTS (Debian bookworm-slim in Docker) | https://nodejs.org/docs/latest-v24.x/api/ |
| Framework | NestJS | v11+ (latest stable) | https://docs.nestjs.com/ |
| HTTP Adapter | **Fastify** (NOT Express) | `@nestjs/platform-fastify` | https://docs.nestjs.com/techniques/performance |
| Language | TypeScript | Strict mode, zero `any` | https://www.typescriptlang.org/docs/ |
| ORM | Prisma | Latest stable | https://www.prisma.io/docs |
| Database | **PostgreSQL 18** | Docker image: `postgres:18-alpine` | https://www.postgresql.org/docs/18/ |
| Cache / Queue Broker | Redis 8 | Docker image: `redis:8-alpine` | https://redis.io/docs/latest/ |
| Validation | **Zod** (NOT Joi, NOT class-validator) | `zod` + `nestjs-zod` v5+ | https://zod.dev/ |
| NestJS + Zod Integration | nestjs-zod v5+ | `createZodDto`, `ZodValidationPipe` | https://github.com/BenLorantfy/nestjs-zod |
| Auth: Hashing | Argon2id | `argon2` (NOT bcrypt) | https://github.com/ranisalt/node-argon2 |
| Auth: JWT | @nestjs/jwt | Passport strategies | https://docs.nestjs.com/security/authentication |
| Auth: OAuth | passport-google-oauth20 | Google OAuth 2.0 | https://docs.nestjs.com/recipes/passport |
| Job Queues | BullMQ | `@nestjs/bullmq` | https://docs.nestjs.com/techniques/queues |
| Email | Resend + React Email | `resend` + `@react-email/components` | https://resend.com/docs / https://react.email/docs/introduction |
| Image/File Storage | Cloudinary | Signed uploads for client, SDK for server | https://cloudinary.com/documentation |
| Video | Bunny.net Stream | Video only; all other media via Cloudinary | https://docs.bunny.net/docs/stream-api-overview |
| Payments | Paystack | Nigerian market standard | https://paystack.com/docs/api/ |
| Logging | Pino | Fastify built-in (NOT Winston, NOT Morgan) | https://docs.nestjs.com/techniques/logger |
| Error Tracking | Sentry | `@sentry/nestjs` | https://docs.sentry.io/platforms/javascript/guides/nestjs/ |
| Metrics | Prometheus | `prom-client` | https://github.com/siimon/prom-client |
| ID Generation | CUID2 | `@paralleldrive/cuid2` (NOT UUID) | https://github.com/paralleldrive/cuid2 |
| Rate Limiting | @nestjs/throttler | Redis store | https://docs.nestjs.com/security/rate-limiting |
| Deployment | Coolify (self-hosted PaaS) | On Digital Ocean Droplet | https://coolify.io/docs |
| Reverse Proxy | Traefik | Managed by Coolify (NOT Caddy, NOT Nginx) | https://doc.traefik.io/traefik/ |
| Swagger / OpenAPI | @nestjs/swagger | Auto-gen from Zod schemas via nestjs-zod | https://docs.nestjs.com/openapi/introduction |
| CSRF | @fastify/csrf-protection | Double-submit cookie | https://github.com/fastify/csrf-protection |
| Security Headers | @fastify/helmet | CSP, HSTS, X-Frame | https://github.com/fastify/fastify-helmet |
| CORS | @fastify/cors | Fastify-native | https://github.com/fastify/fastify-cors |
| Cookies | @fastify/cookie | Refresh tokens + CSRF | https://github.com/fastify/fastify-cookie |
| Testing | Jest + Testcontainers | Real DB in tests | https://docs.nestjs.com/fundamentals/testing / https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/ |
| XSS Sanitisation | DOMPurify + jsdom | Server-side HTML sanitisation | https://github.com/cure53/DOMPurify |
| Events | eventemitter2 | Domain event bus | https://github.com/EventEmitter2/EventEmitter2 |

---

## Commands

```bash
# Development
npm run start:dev        # Hot-reload watch mode
npm run start:debug      # Node debugger + watch mode
npm run start:prod       # Run compiled dist/

# Build
npm run build            # Compile TypeScript (nest build)

# Lint & Format
npm run format:all       # Format entire codebase (Prettier → ESLint --fix). Run this before committing.
npm run lint             # ESLint --fix on src/ + test/
npm run lint:check       # ESLint check-only (no fix) — used in CI

# Testing
npm test                 # Unit tests (Jest)
npm run test:watch       # Unit tests in watch mode
npm run test:cov         # Unit tests + coverage report
npm run test:e2e         # End-to-end tests

# Database
npx prisma migrate dev   # Create + apply migration (dev only)
npx prisma db push       # Quick sync schema (dev only, no migration file)
npx prisma migrate deploy # Apply pending migrations (staging/prod)
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Visual DB browser

# Single test file
npx jest src/modules/auth/auth.service.spec.ts
```

---

## Critical Rules — READ BEFORE WRITING ANY CODE

### TypeScript Rules
- **Strict mode is mandatory.** `strict: true` in tsconfig.json. No exceptions.
- **Zero `any` types.** Use `unknown` and narrow, or define proper types/interfaces.
- **No `as` type assertions** unless absolutely necessary and commented with justification.
- **No enums.** Use `as const` objects with type inference, or Prisma-generated enums only.
- **Prefer `interface` over `type`** for object shapes. Use `type` for unions, intersections, and mapped types.

### Import Rules
- **Absolute imports everywhere in `src/`.** Use the `@/` path alias for all imports. Never use relative imports (`../`, `./`) in source code.
- **Relative imports in tests only.** Test files (`*.spec.ts`, `*.e2e-spec.ts`) use relative imports because Jest resolves modules differently and `moduleNameMapper` can be fragile.
- **Configured in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- **Examples:**

```typescript
// ✅ CORRECT — source code (absolute)
import { PrismaService } from '@/prisma/prisma.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateCourseDto } from '@/modules/courses/schemas/create-course.schema';
import { CircuitBreaker } from '@/common/resilience/circuit-breaker';

// ❌ WRONG — source code (relative)
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../../common/decorators/roles.decorator';

// ✅ CORRECT — test files (relative)
// tests/modules/courses/courses.service.spec.ts
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './schemas/create-course.schema';
```

- **NestJS CLI must also be configured** in `nest-cli.json` to support the alias:

```json
{
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

- **`tsconfig.build.json`** must include the same `paths` as `tsconfig.json`. NestJS uses `tsc-alias` or SWC with path resolution to rewrite aliases at build time. Ensure the build output resolves correctly by adding `tsc-alias` as a post-build step or using the `@swc/cli` path rewriting plugin.

### NestJS / Fastify Rules
> 📖 Fastify adapter docs: https://docs.nestjs.com/techniques/performance
> 📖 NestJS v11 migration: https://docs.nestjs.com/migration-guide
> 📖 Fastify v5 migration: https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/

- **Fastify adapter only.** Import from `@nestjs/platform-fastify`. Never import from `@nestjs/platform-express`.
- **NestJS v11 uses Fastify v5.** Be aware of Fastify v5 breaking changes.
- **All middleware must be Fastify-compatible.** Use `@fastify/*` plugins. Express middleware (helmet, cookie-parser, etc.) will NOT work.
- **No `@fastify/compress`** — Traefik (Coolify's proxy) handles compression. Double compression corrupts responses.
- **Use `ConfigService`** for all environment access. Never use `process.env` directly in services/controllers. Docs: https://docs.nestjs.com/techniques/configuration
- **Register `app.enableShutdownHooks()`** in main.ts. Required for graceful shutdown lifecycle hooks.

### Docker Rules
> 📖 Node.js Docker best practices: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
> 📖 Choosing Node.js Docker image: https://snyk.io/blog/choosing-the-best-node-js-docker-image/

- **Use `node:24-bookworm-slim`** (Debian). **NEVER use Alpine** for the Node.js image. Alpine uses musl libc which causes issues with Argon2, Prisma, and Puppeteer native bindings.
- **Use `dumb-init` as PID 1.** Node.js as PID 1 ignores SIGTERM by default. `dumb-init` forwards signals properly for graceful shutdown. `CMD ["dumb-init", "node", "dist/main.js"]`.
- **Always use exec form CMD** (JSON array). Never string form. Shell form wraps in `/bin/sh -c` which swallows signals.
- **Run as non-root.** `USER node` + `COPY --chown=node:node`. The official Node.js image includes a `node` user.
- **Set `NODE_ENV=production`** in Dockerfile via `ENV`. Don't rely on Coolify env vars alone — frameworks optimise based on this.
- **Production deps only.** `npm ci --omit=dev` in the final build step. No devDependencies in production image.
- **Always include `.dockerignore`.** Prevents `node_modules`, `.git`, `.env` files, and test dirs from entering the build context.

### Validation Rules
> 📖 nestjs-zod v5 setup & API: https://github.com/BenLorantfy/nestjs-zod
> 📖 Zod docs: https://zod.dev/

- **Zod for everything.** DTOs, env config, request bodies, query params, route params.
- **Never use class-validator or class-transformer.** We use `nestjs-zod` v5+ (`ZodValidationPipe`, `createZodDto`).
- **Schema = Type.** Always derive TypeScript types from Zod schemas via `z.infer<typeof schema>`. Never define interfaces separately.
- **Strict schemas.** All Zod object schemas must use `.strict()` to reject unknown fields.
- **nestjs-zod v5 setup requires:** `ZodValidationPipe` as global pipe, `ZodSerializerInterceptor` as global interceptor. See: https://github.com/BenLorantfy/nestjs-zod#setup

### Database Rules
> 📖 Prisma docs: https://www.prisma.io/docs
> 📖 Prisma with NestJS: https://docs.nestjs.com/recipes/prisma
> 📖 PostgreSQL 18 docs: https://www.postgresql.org/docs/18/

- **Prisma is the only data access layer.** No raw SQL except for full-text search (one exempted `$queryRaw`).
- **CUID2 for all primary keys.** Use `@id @default(cuid())` in Prisma schema.
- **Soft deletes everywhere.** Every main entity has `deletedAt DateTime?`. Prisma middleware auto-filters.
- **UTC for all timestamps.** `@default(now())` produces UTC. No timezone columns. No timezone conversion on the backend. API returns ISO 8601 with Z suffix.
- **Audit columns on all entities:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

### Auth Rules
> 📖 NestJS auth guide: https://docs.nestjs.com/security/authentication
> 📖 Argon2 node: https://github.com/ranisalt/node-argon2
> 📖 NestJS JWT: https://docs.nestjs.com/security/authentication#jwt-token

- **Argon2id only.** Never bcrypt. Config: memoryCost 65536 (64MB), timeCost 3, parallelism 4.
- **Argon2 semaphore required.** Max 10 concurrent hashes. Queue overflow returns 429.
- **Access token:** JWT, 15m TTL, in response body, carried in `Authorization: Bearer` header.
- **Refresh token:** JWT, 7d TTL, in `HttpOnly; Secure; SameSite=Strict` cookie. Stored as SHA-256 hash in DB.
- **Token rotation:** Both tokens rotated atomically on refresh. Old refresh hash deleted.

### API Rules
> 📖 NestJS controllers: https://docs.nestjs.com/controllers
> 📖 NestJS OpenAPI: https://docs.nestjs.com/openapi/introduction

- **All endpoints prefixed with `/api/v1/`.** Set via `app.setGlobalPrefix('api/v1')`.
- **Cursor-based pagination only.** Never offset-based. Params: `cursor`, `limit` (default 20, max 100). Response: `{ data[], meta: { nextCursor, hasMore, total } }`.
- **Standardised error response:** `{ statusCode, message, error, timestamp, path, requestId }`.
- **Request IDs:** CUID2 assigned in Fastify `onRequest` hook. Propagated through logs, Sentry, BullMQ job metadata.
- **Response serialisation:** Use Fastify's `fast-json-stringify` with per-route response schemas. Only declared fields in responses.

### Security Rules
> 📖 NestJS security overview: https://docs.nestjs.com/security/helmet
> 📖 NestJS CORS: https://docs.nestjs.com/security/cors
> 📖 NestJS CSRF: https://docs.nestjs.com/security/csrf-protection
> 📖 NestJS rate limiting: https://docs.nestjs.com/security/rate-limiting

- **No raw SQL.** ESLint rule bans `prisma.$queryRaw` and `prisma.$executeRaw`. One exemption for full-text search with lint-disable + comment.
- **XSS sanitisation.** All user-generated content sanitised with `dompurify` before storage. Docs: https://github.com/cure53/DOMPurify
- **CSRF protection.** `@fastify/csrf-protection` with double-submit cookie. Enabled in staging/production.
- **Tenant-scoping middleware.** Prisma middleware injects `WHERE userId = currentUser.id` for student-role queries via AsyncLocalStorage.
- **Webhook HMAC verification.** All incoming webhooks (Paystack, Bunny, Cloudinary) verified before processing.

---

## Project Structure

```
ebsn-server/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── main.ts                          # Fastify bootstrap + graceful shutdown
│   ├── app.module.ts
│   ├── common/
│   │   ├── config/                      # Zod env schema + typed config
│   │   ├── decorators/                  # @Roles, @Public, @CurrentUser, @IdempotencyKey
│   │   ├── schemas/                     # shared Zod schemas (pagination, sort, filter)
│   │   ├── exceptions/                  # global exception filter, error serialiser
│   │   ├── guards/                      # JwtAuthGuard, RolesGuard, ThrottlerGuard
│   │   ├── interceptors/                # logging, transform, timeout, cache
│   │   ├── pipes/                       # ZodValidationPipe
│   │   ├── middleware/                   # request-id, correlation-id
│   │   ├── resilience/                  # CircuitBreaker, Semaphore, Degradation
│   │   └── utils/                       # helpers, constants, enums
│   ├── modules/
│   │   ├── auth/                        # login, register, OAuth, JWT, refresh, CSRF
│   │   ├── users/                       # CRUD, profile, data export, account deletion
│   │   ├── courses/                     # CRUD, enrollment toggle, search
│   │   ├── course-outlines/             # outline CRUD (topics, outcomes)
│   │   ├── modules/                     # module CRUD, ordering
│   │   ├── lessons/                     # lesson CRUD, ordering within module
│   │   ├── quizzes/                     # quiz CRUD, passing threshold, max attempts
│   │   ├── enrollment/                  # enrollment, payment-gated flow
│   │   ├── progress/                    # lesson completion, course completion logic
│   │   ├── certificates/                # PDF generation, verification, re-issue, hash
│   │   ├── payments/                    # Paystack integration, reconciliation cron
│   │   ├── storage/                     # Cloudinary adapter (upload limits, cleanup)
│   │   ├── video/                       # Bunny.net Stream adapter + encoding webhooks
│   │   ├── email/                       # Resend + React Email templates
│   │   ├── webhooks/                    # unified ingress (Bunny, Paystack, Cloudinary)
│   │   ├── search/                      # PostgreSQL full-text search
│   │   ├── health/                      # liveness/readiness + circuit status
│   │   └── reporting/                   # reports, CSV, audit log, bulk ops
│   ├── prisma/                          # PrismaModule, PrismaService, tenant-scoping middleware
│   ├── queue/                           # BullMQ module, processors, correlation
│   └── cache/                           # Redis cache, stampede prevention, degradation
├── emails/                              # React Email templates (.tsx)
├── docker/
│   ├── Dockerfile                       # multi-stage production build
│   ├── Dockerfile.dev                   # dev with hot reload
│   └── docker-compose.yml               # all services (Coolify uses this)
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── disaster-recovery.sh
├── docs/
│   ├── DISASTER-RECOVERY.md
│   ├── API-DEPRECATION.md
│   └── KNOWN-LIMITATIONS.md
├── .env.example
├── .dockerignore                        # REQUIRED — excludes node_modules, .git, .env from build
├── tsconfig.json
├── nest-cli.json
├── eslint.config.mjs
├── CLAUDE.md                            # THIS FILE
└── package.json
```

---

## Module Implementation Pattern

> 📖 NestJS modules: https://docs.nestjs.com/modules
> 📖 NestJS controllers: https://docs.nestjs.com/controllers
> 📖 NestJS providers: https://docs.nestjs.com/providers

Every module follows this structure:

```
src/modules/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts          # Route handlers only. No business logic.
├── {module-name}.service.ts             # All business logic.
├── schemas/
│   ├── create-{entity}.schema.ts        # Zod schema + inferred type + createZodDto
│   ├── update-{entity}.schema.ts
│   └── query-{entity}.schema.ts
├── interfaces/
│   └── {name}.interface.ts
└── {module-name}.constants.ts           # (optional)
```

### Schema File Pattern

> 📖 nestjs-zod createZodDto: https://github.com/BenLorantfy/nestjs-zod#createzoddto

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().min(0).default(0),
  currency: z.string().length(3).default('NGN'),
  bannerUrl: z.string().url().optional(),
}).strict();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export class CreateCourseDto extends createZodDto(createCourseSchema) {}
```

### Controller Pattern

> 📖 NestJS guards: https://docs.nestjs.com/guards
> 📖 NestJS custom decorators: https://docs.nestjs.com/custom-decorators

```typescript
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }
}
```

### Service Pattern

> 📖 Prisma CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud

```typescript
@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateCourseInput) {
    return this.prisma.primary.course.create({ data: { ...input } });
  }
}
```

---

## Database Schema (Prisma)

> 📖 Prisma schema reference: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
> 📖 Prisma relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
> 📖 Prisma migrations: https://www.prisma.io/docs/orm/prisma-migrate
> 📖 Prisma middleware: https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware
> 📖 PostgreSQL full-text search: https://www.postgresql.org/docs/18/textsearch.html
> 📖 Prisma read replicas: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/read-replicas

### Conventions

- **All IDs:** `id String @id @default(cuid())`
- **All timestamps:** `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- **Soft delete:** `deletedAt DateTime?`
- **Audit:** `createdBy String?`, `updatedBy String?`
- **Optimistic locking:** `version Int @default(0)` (on Enrollment, LessonProgress, QuizAttempt)
- **Ordering:** `order Int` with `@@unique([parentId, order])`

### Core Entities

See the v5 architecture doc for full entity details. Abbreviated:

User, Course (with price/currency), CourseOutline, OutlineModule, Module (ordered), Lesson (ordered, VIDEO/READING/QUIZ), Quiz (passingScore, maxAttempts), Question, QuestionOption, QuizAttempt, Enrollment, LessonProgress, Payment, Certificate (with pdfHash), IdempotencyKey, AuditLog.

### Read/Write Split

```typescript
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly primary: PrismaClient;  // DATABASE_URL — all writes
  public readonly read: PrismaClient;     // DATABASE_READ_URL — read-only (defaults to DATABASE_URL)
}
```

- `this.prisma.primary` — CREATE, UPDATE, DELETE
- `this.prisma.read` — findMany, findFirst, findUnique, aggregate, count

---

## Authentication & Authorisation

> 📖 NestJS auth: https://docs.nestjs.com/security/authentication
> 📖 NestJS authorisation: https://docs.nestjs.com/security/authorization
> 📖 Passport recipes: https://docs.nestjs.com/recipes/passport

### Guard Chain (Global)

```
Request → JwtAuthGuard → RolesGuard → Controller method
```

`@Public()` bypasses both. `@Roles(Role.ADMIN)` restricts access.

---

## Circuit Breaker & Resilience

State stored in Redis (`ebsn:circuit:{name}`). See v5 architecture doc for full per-service config table.

---

## Async Processing (BullMQ)

> 📖 NestJS queues: https://docs.nestjs.com/techniques/queues
> 📖 BullMQ docs: https://docs.bullmq.io/

9 queues total. Every job carries `requestId` for correlation. See architecture doc for full table.

---

## Payment Flow (Paystack)

> 📖 Paystack Init: https://paystack.com/docs/api/transaction/#initialize
> 📖 Paystack Verify: https://paystack.com/docs/api/transaction/#verify
> 📖 Paystack Webhooks: https://paystack.com/docs/payments/webhooks/

Free courses skip Paystack. Paid courses: init → checkout → verify → webhook (backup). Reconciliation cron every 5 min.

---

## Certificate System

> 📖 Puppeteer: https://pptr.dev/
> 📖 Cloudinary upload: https://cloudinary.com/documentation/image_upload_api_reference
> 📖 QR code: https://github.com/soldair/node-qrcode

Generate EBSN-YYYY-XXXXXXXX → Puppeteer PDF → QR embed → SHA-256 hash → Cloudinary upload → email notification.

---

## API Endpoints Reference

All prefixed with `/api/v1/`. Full table in architecture doc. Key endpoints:

**Auth:** register, login, refresh, logout, google, verify-email, forgot/reset-password
**Users:** me (GET/PATCH), me/export, me/delete, list (Admin), approve (Admin)
**Courses:** CRUD, search, outline
**Modules:** CRUD, reorder
**Lessons:** CRUD, reorder
**Quizzes:** CRUD, attempt, attempts list
**Enrollment:** enroll, my enrollments, bulk (Admin)
**Progress:** complete lesson, get progress
**Payments:** verify
**Certificates:** public verify, get by enrollment, reissue (Admin)
**Storage:** upload-url (Admin)
**Webhooks:** paystack, bunny (HMAC verified)
**Reports:** completions, student export, audit log (SuperAdmin)
**Health:** liveness, readiness

---

## Environment Variables

> 📖 NestJS configuration: https://docs.nestjs.com/techniques/configuration

Validated at startup via Zod. Invalid = crash. Dev: `.env.dev` file. Staging/Prod: Coolify panel.

See env schema in architecture doc for full variable list.

---

## Caching

> 📖 NestJS caching: https://docs.nestjs.com/techniques/caching
> 📖 ioredis: https://github.com/redis/ioredis

Cache aside pattern. Key: `ebsn:{module}:{entity}:{id}`. Stampede prevention via `SET NX PX`.

---

## Docker Configuration

> 📖 Node.js Docker best practices: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
> 📖 Choosing the best Node.js Docker image: https://snyk.io/blog/choosing-the-best-node-js-docker-image/
> 📖 Node.js Docker team: https://github.com/nodejs/docker-node

### Critical: Why bookworm-slim, NOT Alpine

**Never use `node:alpine` for this project.** The CLAUDE.md and all Dockerfiles use `node:24-bookworm-slim`. Reasons:

- **glibc compatibility.** Alpine uses musl libc. Argon2 (password hashing) and Prisma (engine binaries) compile native C bindings against glibc. musl can cause silent performance degradation or crashes in your most security-critical path.
- **Official support.** Alpine Node.js builds are "unofficial" (from unofficial-builds.nodejs.org) with minimal testing. Debian-based images are officially maintained by the Node.js Docker team.
- **Vulnerability scanning.** Many scanners (Trivy, Snyk) struggle to detect software artifacts on Alpine. Your security pipeline depends on accurate scanning.
- **Puppeteer.** Certificate PDF generation uses Puppeteer, which requires Chromium dependencies that are straightforward on Debian but painful on Alpine.

The ~75MB size difference (Alpine ~145MB vs slim ~220MB) is negligible on a VPS.

### Image Selection

| Service | Image | Rationale |
|---|---|---|
| API / Worker | `node:24-bookworm-slim` | Official Node.js, glibc, slim footprint |
| PostgreSQL | `postgres:18-alpine` | No native bindings concern, safe for Alpine |
| Redis | `redis:8-alpine` | No native bindings concern, safe for Alpine |

### Dockerfile (Production — Multi-Stage)

```dockerfile
# ── Stage 1: Build ──
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Prune to production dependencies only
RUN npm ci --omit=dev

# ── Stage 2: Production ──
FROM node:24-bookworm-slim

# dumb-init for proper PID 1 signal handling (graceful shutdown)
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# Copy with correct ownership (non-root)
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/package.json ./

# Run as non-root user (built-in 'node' user from official image)
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# dumb-init wraps node process, forwards SIGTERM/SIGINT correctly
CMD ["dumb-init", "node", "dist/main.js"]
```

### Dockerfile Best Practices Applied

| Practice | Implementation | Why |
|---|---|---|
| **Deterministic base image** | `node:24-bookworm-slim` (pin exact version in production) | Prevents non-deterministic builds from `latest` |
| **Production deps only** | `npm ci --omit=dev` after build | Excludes devDependencies from final image |
| **NODE_ENV=production** | `ENV NODE_ENV=production` baked into image | NestJS/Fastify optimise when this is set |
| **Non-root user** | `USER node` + `COPY --chown=node:node` | Least privilege. Attacker can't escalate to root |
| **dumb-init as PID 1** | `CMD ["dumb-init", "node", "dist/main.js"]` | Node.js as PID 1 ignores SIGTERM by default. dumb-init forwards signals properly for graceful shutdown |
| **exec form CMD** | JSON array `["dumb-init", "node", ...]` not string | Prevents shell wrapping, ensures direct signal delivery |
| **Layer caching** | `COPY package*.json` before `COPY .` | Dependencies layer cached unless package.json changes |
| **Multi-stage build** | builder → production | Build tools and devDeps never reach production image |
| **Minimal apt-get** | `--no-install-recommends` + `rm -rf /var/lib/apt/lists/*` | Keeps image slim after installing dumb-init |
| **stop_grace_period: 35s** | In docker-compose.yml | Exceeds the 30s drain timeout, prevents SIGKILL during graceful shutdown |

### .dockerignore

**Every project MUST have a `.dockerignore` file.** Without it, `COPY .` sends everything (node_modules, .git, .env files, tests) to the Docker daemon.

```
node_modules
.git
.gitignore
.env*
!.env.example
dist
coverage
*.md
!README.md
docker/
scripts/
docs/
.vscode
.idea
*.log
```

### docker-compose.yml (used by Coolify)

```yaml
services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    restart: unless-stopped
    stop_grace_period: 35s
    environment:
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=Host(`api.ebsn.ng`)
      - traefik.http.routers.api.tls.certresolver=letsencrypt

  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile
    restart: unless-stopped
    stop_grace_period: 35s
    command: ["dumb-init", "node", "dist/worker.js"]
    environment:
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:18-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ebsn
      POSTGRES_USER: ebsn
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ebsn"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

---

## Monitoring

> 📖 Sentry NestJS: https://docs.sentry.io/platforms/javascript/guides/nestjs/
> 📖 NestJS health checks: https://docs.nestjs.com/recipes/terminus
> 📖 Prometheus client: https://github.com/siimon/prom-client

Health: `/health` (liveness) + `/health/ready` (readiness with circuit state).

---

## Testing

> 📖 NestJS testing: https://docs.nestjs.com/fundamentals/testing
> 📖 Testcontainers: https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/
> 📖 Jest: https://jestjs.io/docs/getting-started

Real PostgreSQL 18 + Redis 8 via Testcontainers. Never mock the database.

### Jest Path Alias Configuration

Tests use relative imports, but Jest still needs to resolve the `@/` alias when source files use it internally. Add to `jest` config in `package.json` or `jest.config.ts`:

```json
{
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

---

## Implementation Order

8 phases, 49 steps. See architecture doc for full list. Summary:

1. **Foundation:** Scaffold, Docker, Prisma, config, logging, health
2. **Auth:** Users, auth, Argon2, JWT, OAuth, RBAC, tenant scoping, rate limiting
3. **Learning:** Courses, outlines, modules, lessons, quizzes, search
4. **Enrollment:** Enrollment, Paystack, reconciliation, progress, quiz attempts
5. **Certificates:** Generation, Cloudinary, Bunny, verification, email, webhooks
6. **Resilience:** Circuit breakers, Redis degradation, queues, Sentry, Prometheus, shutdown
7. **Admin:** Reporting, audit, bulk ops, NDPA, media cleanup, idempotency
8. **Deployment:** Coolify, CI/CD, backups, DR drill

---

## Key Documentation Links (Quick Reference)

**Always fetch the latest docs before implementing.** These links should be checked for current API signatures:

| Topic | URL |
|---|---|
| **NestJS v11 Docs** | https://docs.nestjs.com/ |
| **NestJS v11 Migration** | https://docs.nestjs.com/migration-guide |
| **Fastify v5 Docs** | https://fastify.dev/docs/latest/ |
| **Fastify v5 Migration** | https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/ |
| **Prisma Docs** | https://www.prisma.io/docs |
| **Prisma Client API** | https://www.prisma.io/docs/orm/reference/prisma-client-reference |
| **Prisma Migrate** | https://www.prisma.io/docs/orm/prisma-migrate |
| **Zod Docs** | https://zod.dev/ |
| **nestjs-zod v5** | https://github.com/BenLorantfy/nestjs-zod |
| **BullMQ** | https://docs.bullmq.io/ |
| **NestJS Queues** | https://docs.nestjs.com/techniques/queues |
| **Paystack API** | https://paystack.com/docs/api/ |
| **Paystack Webhooks** | https://paystack.com/docs/payments/webhooks/ |
| **Cloudinary Node SDK** | https://cloudinary.com/documentation/node_integration |
| **Cloudinary Upload API** | https://cloudinary.com/documentation/image_upload_api_reference |
| **Bunny.net Stream** | https://docs.bunny.net/docs/stream-api-overview |
| **Resend Node SDK** | https://resend.com/docs/send-with-nodejs |
| **React Email** | https://react.email/docs/introduction |
| **Sentry NestJS** | https://docs.sentry.io/platforms/javascript/guides/nestjs/ |
| **ioredis** | https://github.com/redis/ioredis |
| **Coolify** | https://coolify.io/docs |
| **Traefik** | https://doc.traefik.io/traefik/ |
| **PostgreSQL 18** | https://www.postgresql.org/docs/18/ |
| **Redis** | https://redis.io/docs/latest/ |
| **Puppeteer** | https://pptr.dev/ |
| **Argon2 (Node)** | https://github.com/ranisalt/node-argon2 |
| **CUID2** | https://github.com/paralleldrive/cuid2 |
| **DOMPurify** | https://github.com/cure53/DOMPurify |
| **Testcontainers** | https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/ |
| **@fastify/helmet** | https://github.com/fastify/fastify-helmet |
| **@fastify/cors** | https://github.com/fastify/fastify-cors |
| **@fastify/cookie** | https://github.com/fastify/fastify-cookie |
| **@fastify/csrf-protection** | https://github.com/fastify/csrf-protection |
| **NestJS Rate Limiting** | https://docs.nestjs.com/security/rate-limiting |
| **NestJS Auth** | https://docs.nestjs.com/security/authentication |
| **NestJS Authorisation** | https://docs.nestjs.com/security/authorization |
| **NestJS Config** | https://docs.nestjs.com/techniques/configuration |
| **NestJS Health** | https://docs.nestjs.com/recipes/terminus |
| **NestJS Events** | https://docs.nestjs.com/techniques/events |
| **NestJS Testing** | https://docs.nestjs.com/fundamentals/testing |
| **EventEmitter2** | https://github.com/EventEmitter2/EventEmitter2 |
| **Node.js Docker Best Practices** | https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/ |
| **Choosing Node.js Docker Image** | https://snyk.io/blog/choosing-the-best-node-js-docker-image/ |

---

## Checklist Before Every PR

- [ ] No `any` types
- [ ] No `as` assertions (unless justified in comment)
- [ ] All DTOs use Zod schemas (no class-validator)
- [ ] All new endpoints have `@Roles` or `@Public` decorator
- [ ] All external calls wrapped in circuit breaker
- [ ] All queue jobs include `requestId` in data
- [ ] New Prisma queries use `this.prisma.read` for reads, `this.prisma.primary` for writes
- [ ] Timestamps are UTC (no timezone conversion)
- [ ] Soft delete used (never hard delete unless NDPA erasure)
- [ ] New env vars added to `env.schema.ts` AND `.env.example`
- [ ] All imports in `src/` use `@/` alias (no relative imports like `../`)
- [ ] All imports in test files use relative imports (no `@/` alias)
- [ ] Tests pass with real PostgreSQL 18 + Redis 8 (Testcontainers)
- [ ] Fetched latest docs for any library used (links above)