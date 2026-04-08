import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/db/prisma.service";

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}

export interface ReadinessResponse {
  status: "ok" | "degraded";
  checks: {
    database: "up" | "down";
  };
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    const isDatabaseHealthy = await this.prisma.isHealthy();

    return {
      status: isDatabaseHealthy ? "ok" : "degraded",
      checks: {
        database: isDatabaseHealthy ? "up" : "down",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
