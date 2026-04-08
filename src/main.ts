import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import fastifyHelmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";

import { AppModule } from "./app.module";
import type { EnvironmentVariables } from "./common/config/env.schema";
import { GlobalExceptionFilter } from "./common/exceptions/global-exception.filter";
import { registerRequestIdHook } from "./common/middleware/request-id.hook";

async function bootstrap() {
  const app: NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );
  const logger = new Logger("Bootstrap");
  const configService: ConfigService<EnvironmentVariables, true> = app.get(ConfigService);
  const port = configService.getOrThrow<number>("PORT");
  const nodeEnv = configService.getOrThrow<EnvironmentVariables["NODE_ENV"]>("NODE_ENV");

  await app.register(fastifyCookie);
  await app.register(fastifyCors, {
    credentials: true,
    origin: true,
  });
  await app.register(fastifyHelmet);
  if (nodeEnv !== "development") {
    await app.register(fastifyCsrfProtection);
  }

  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();
  registerRequestIdHook(fastifyInstance);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ZodSerializerInterceptor());
  const globalExceptionFilter = new GlobalExceptionFilter();
  app.useGlobalFilters(globalExceptionFilter);
  app.enableShutdownHooks();
  app.setGlobalPrefix("api/v1");

  await app.listen(port, "0.0.0.0");
  logger.log(`Server started on port ${port}`);
}

void bootstrap();
