-- Seed default tenant
INSERT INTO "Tenant" ("id", "name", "slug")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default')
ON CONFLICT ("slug") DO NOTHING;

-- Backfill projects without tenant
UPDATE "Project"
SET "tenantId" = '00000000-0000-0000-0000-000000000001'
WHERE "tenantId" IS NULL;

-- Backfill core tables tenantId from related project
UPDATE "Agent" a
SET "tenantId" = p."tenantId"
FROM "Project" p
WHERE a."projectId" = p."id" AND a."tenantId" IS NULL;

UPDATE "Thread" t
SET "tenantId" = p."tenantId"
FROM "Project" p
WHERE t."projectId" = p."id" AND t."tenantId" IS NULL;

UPDATE "Message" m
SET "tenantId" = p."tenantId"
FROM "Project" p
WHERE m."projectId" = p."id" AND m."tenantId" IS NULL;

-- Safety checks: after backfill tenantId must be present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Project" WHERE "tenantId" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: Project.tenantId still contains NULLs';
  END IF;

  IF EXISTS (SELECT 1 FROM "Agent" WHERE "tenantId" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: Agent.tenantId still contains NULLs';
  END IF;

  IF EXISTS (SELECT 1 FROM "Thread" WHERE "tenantId" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: Thread.tenantId still contains NULLs';
  END IF;

  IF EXISTS (SELECT 1 FROM "Message" WHERE "tenantId" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: Message.tenantId still contains NULLs';
  END IF;
END $$;
