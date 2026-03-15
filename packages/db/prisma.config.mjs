import "dotenv/config";

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/amb-db",
  },
  migrations: {
    path: "prisma/migrations",
  },
};
