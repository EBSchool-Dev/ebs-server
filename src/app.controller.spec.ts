import { Test, type TestingModule } from "@nestjs/testing";

import { PrismaService } from "./database/prisma.service";
import { HealthController } from "./modules/health/health.controller";
import { HealthService } from "./modules/health/health.service";

describe("AppController", () => {
  let healthController: HealthController;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "3000";
    process.env.DATABASE_URL = "postgresql://ebsn:ebsn@localhost:5432/ebsn";
    process.env.DATABASE_READ_URL = "postgresql://ebsn:ebsn@localhost:5432/ebsn";
    process.env.REDIS_URL = "redis://:redis_password@localhost:6379";
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe("health", () => {
    it("should return liveness", () => {
      expect(healthController.liveness().status).toBe("ok");
    });
  });
});
