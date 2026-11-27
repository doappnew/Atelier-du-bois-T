import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit faire au moins 32 caractères"),
  PI_API_KEY: z.string().min(1),
  CLIENT_ORIGIN: z.string().min(1),
  PI_VALIDATION_KEY: z.string().default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Configuration invalide :", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
