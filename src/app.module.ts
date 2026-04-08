import { Module } from "@nestjs/common";

import { AppConfigModule } from "./common/config/config.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [AppConfigModule, DatabaseModule, HealthModule],
})
export class AppModule {}
