-- E9A-001: Add taskPrefix to Project (nullable initially for zero-downtime)
ALTER TABLE "Project" ADD COLUMN "taskPrefix" VARCHAR(5);

-- E9A-002: Add taskSequence to Project
ALTER TABLE "Project" ADD COLUMN "taskSequence" INT NOT NULL DEFAULT 0;

-- E9A-003: Add key to Issue (nullable initially for zero-downtime)
ALTER TABLE "Issue" ADD COLUMN "key" VARCHAR(10);

-- E9A-005: Backfill taskPrefix from slug (first 3 chars uppercase, handle conflicts)
WITH ranked AS (
  SELECT id, "tenantId",
    UPPER(LEFT(slug, 3)) AS candidate,
    ROW_NUMBER() OVER (
      PARTITION BY "tenantId", UPPER(LEFT(slug, 3))
      ORDER BY "createdAt"
    ) AS rn
  FROM "Project"
  WHERE "taskPrefix" IS NULL
)
UPDATE "Project" p
SET "taskPrefix" = CASE
  WHEN r.rn = 1 THEN r.candidate
  ELSE r.candidate || (r.rn - 1)::text
END
FROM ranked r
WHERE p.id = r.id;

-- E9A-005: Backfill issue keys (ordered by createdAt ASC per project)
WITH numbered AS (
  SELECT i.id, i."projectId",
    ROW_NUMBER() OVER (
      PARTITION BY i."projectId"
      ORDER BY i."createdAt"
    ) AS seq
  FROM "Issue" i
  WHERE i."key" IS NULL
)
UPDATE "Issue" i
SET "key" = p."taskPrefix" || '-' || LPAD(n.seq::text, 4, '0')
FROM numbered n
JOIN "Project" p ON p.id = n."projectId"
WHERE i.id = n.id;

-- E9A-005: Update taskSequence to max assigned number per project
UPDATE "Project" p
SET "taskSequence" = COALESCE(sub.max_seq, 0)
FROM (
  SELECT "projectId", COUNT(*) AS max_seq
  FROM "Issue"
  WHERE "key" IS NOT NULL
  GROUP BY "projectId"
) sub
WHERE p.id = sub."projectId";

-- E9A-004: Add unique constraint on Project(tenantId, taskPrefix)
CREATE UNIQUE INDEX "Project_tenantId_taskPrefix_key" ON "Project"("tenantId", "taskPrefix");

-- E9A-004: Add unique constraint on Issue(projectId, key)
CREATE UNIQUE INDEX "Issue_projectId_key_key" ON "Issue"("projectId", "key");

-- E9A-004: Add index on Issue.key for fast lookups
CREATE INDEX "Issue_key_idx" ON "Issue"("key");
