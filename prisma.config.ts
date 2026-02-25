// Prisma configuration for PostgreSQL
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed-agents.ts",
  },
  datasource: {
    // Для prisma generate при установке (postinstall) DATABASE_URL может быть не задан
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/amb-db",
  },
});
