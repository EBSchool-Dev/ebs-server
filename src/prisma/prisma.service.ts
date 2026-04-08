import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/prisma/client";

import type { EnvironmentVariables } from "../common/config/env.schema";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly primary: PrismaClient;
  public readonly read: PrismaClient;

  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
    const primaryUrl = this.configService.getOrThrow<string>("DATABASE_URL");
    const readUrl = this.configService.get<string>("DATABASE_READ_URL") ?? primaryUrl;
    const primaryPool = new Pool({ connectionString: primaryUrl });
    const readPool = new Pool({ connectionString: readUrl });

    this.primary = new PrismaClient({
      adapter: new PrismaPg(primaryPool),
    });

    this.read = new PrismaClient({
      adapter: new PrismaPg(readPool),
    });
  }

  async onModuleInit(): Promise<void> {
    await Promise.all([this.primary.$connect(), this.read.$connect()]);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.primary.$disconnect(), this.read.$disconnect()]);
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.read.$connect();
      return true;
    } catch {
      return false;
    }
  }
}
