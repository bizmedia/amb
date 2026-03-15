-- Ensure default tenant exists
INSERT INTO "Tenant" ("id", "name", "slug")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default')
ON CONFLICT ("slug") DO NOTHING;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "roles" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default dashboard user
INSERT INTO "User" ("id", "tenantId", "email", "passwordHash", "displayName", "roles", "isActive")
VALUES (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'admin@local.test',
  'scrypt$default-user-salt-v1$bf6e2bad2e2ed878d45bd4efa34a0ebb92c55eb1073321b3d5dd8919d1de806c3875c29fe28e82d3cd3535c16265244aeeaceb41d34af2f0157561efc9ec5a4f',
  'Default Admin',
  ARRAY['tenant-admin'],
  true
)
ON CONFLICT ("email") DO NOTHING;
