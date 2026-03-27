-- CreateEnum
CREATE TYPE "EpicStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Epic" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EpicStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Epic_projectId_idx" ON "Epic"("projectId");

-- CreateIndex
CREATE INDEX "Epic_projectId_status_idx" ON "Epic"("projectId", "status");

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "epicId" TEXT;

-- CreateIndex
CREATE INDEX "Task_epicId_idx" ON "Task"("epicId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS (project-scoped, same pattern as Task)
ALTER TABLE "Epic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Epic" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS epic_rls_select ON "Epic";
DROP POLICY IF EXISTS epic_rls_insert ON "Epic";
DROP POLICY IF EXISTS epic_rls_update ON "Epic";
DROP POLICY IF EXISTS epic_rls_delete ON "Epic";

CREATE POLICY epic_rls_select ON "Epic"
  FOR SELECT
  USING (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY epic_rls_insert ON "Epic"
  FOR INSERT
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY epic_rls_update ON "Epic"
  FOR UPDATE
  USING (
    "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY epic_rls_delete ON "Epic"
  FOR DELETE
  USING (
    "projectId" = current_setting('app.project_id', true)
  );
