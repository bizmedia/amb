import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// `pnpm --filter @amb-app/db run db:migrate:*` uses cwd `packages/db`, so root `.env` is not loaded by default.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/amb-db",
  },
  migrations: {
    path: "prisma/migrations",
  },
};
