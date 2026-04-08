import { Controller, Get } from "@nestjs/common";

import { Public } from "@/common/decorators";

import { type HealthResponse, HealthService, type ReadinessResponse } from "./health.service";

@Public()
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  liveness(): HealthResponse {
    return this.healthService.getLiveness();
  }

  @Get("ready")
  readiness(): Promise<ReadinessResponse> {
    return this.healthService.getReadiness();
  }
}
