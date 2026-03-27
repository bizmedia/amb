-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sprint_projectId_idx" ON "Sprint"("projectId");

-- CreateIndex
CREATE INDEX "Sprint_projectId_status_idx" ON "Sprint"("projectId", "status");

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "sprintId" TEXT;

-- CreateIndex
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ADR-014 §3: at most one ACTIVE sprint per project
CREATE UNIQUE INDEX "Sprint_projectId_active_unique" ON "Sprint" ("projectId")
WHERE ("status" = 'ACTIVE');

-- RLS
ALTER TABLE "Sprint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sprint" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sprint_rls_select ON "Sprint";
DROP POLICY IF EXISTS sprint_rls_insert ON "Sprint";
DROP POLICY IF EXISTS sprint_rls_update ON "Sprint";
DROP POLICY IF EXISTS sprint_rls_delete ON "Sprint";

CREATE POLICY sprint_rls_select ON "Sprint"
  FOR SELECT
  USING (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY sprint_rls_insert ON "Sprint"
  FOR INSERT
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY sprint_rls_update ON "Sprint"
  FOR UPDATE
  USING (
    "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY sprint_rls_delete ON "Sprint"
  FOR DELETE
  USING (
    "projectId" = current_setting('app.project_id', true)
  );
