import { Module } from "@nestjs/common";

import { AppConfigModule } from "./common/config/config.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule],
})
export class AppModule {}
