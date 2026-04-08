import type { EnvironmentVariables } from "./env.schema";
import { toEnvironmentVariables } from "./env.schema";

export interface AppConfiguration {
  app: {
    nodeEnv: EnvironmentVariables["NODE_ENV"];
    port: number;
  };
  database: {
    primaryUrl: string;
    readUrl: string;
  };
  redis: {
    url: string;
  };
}

export default (): AppConfiguration => {
  const env: EnvironmentVariables = toEnvironmentVariables(process.env);

  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
    },
    database: {
      primaryUrl: env.DATABASE_URL,
      readUrl: env.DATABASE_READ_URL ?? env.DATABASE_URL,
    },
    redis: {
      url: env.REDIS_URL,
    },
  };
};
