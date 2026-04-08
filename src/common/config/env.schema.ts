import { z } from "zod";

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1).default("postgresql://ebsn:ebsn@localhost:5432/ebsn"),
    DATABASE_READ_URL: z.string().min(1).optional(),
    REDIS_URL: z.string().min(1).default("redis://:redis_password@localhost:6379"),
  })
  .strict();

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function toEnvironmentVariables(source: Record<string, unknown>): EnvironmentVariables {
  return envSchema.parse({
    NODE_ENV: source.NODE_ENV,
    PORT: source.PORT,
    DATABASE_URL: source.DATABASE_URL,
    DATABASE_READ_URL: source.DATABASE_READ_URL,
    REDIS_URL: source.REDIS_URL,
  });
}
