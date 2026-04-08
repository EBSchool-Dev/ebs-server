import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import configuration from "./configuration";
import { toEnvironmentVariables } from "./env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
      validate: (config: Record<string, unknown>) => toEnvironmentVariables(config),
    }),
  ],
})
export class AppConfigModule {}
