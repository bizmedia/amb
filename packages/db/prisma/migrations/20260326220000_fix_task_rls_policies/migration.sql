-- After ALTER TABLE "Issue" RENAME TO "Task", the old policies still reference
-- the old names. Drop them and re-create with correct names on "Task".
-- Also enable RLS + FORCE (rename preserves ENABLE but belt-and-suspenders).

ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" FORCE ROW LEVEL SECURITY;

-- Drop old issue_rls_* policies (they survived the rename on the same OID)
DROP POLICY IF EXISTS issue_rls_select ON "Task";
DROP POLICY IF EXISTS issue_rls_insert ON "Task";
DROP POLICY IF EXISTS issue_rls_update ON "Task";
DROP POLICY IF EXISTS issue_rls_delete ON "Task";

-- Drop any already-correct names in case of re-run
DROP POLICY IF EXISTS task_rls_select ON "Task";
DROP POLICY IF EXISTS task_rls_insert ON "Task";
DROP POLICY IF EXISTS task_rls_update ON "Task";
DROP POLICY IF EXISTS task_rls_delete ON "Task";

CREATE POLICY task_rls_select ON "Task"
  FOR SELECT
  USING (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY task_rls_insert ON "Task"
  FOR INSERT
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY task_rls_update ON "Task"
  FOR UPDATE
  USING (
    "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY task_rls_delete ON "Task"
  FOR DELETE
  USING (
    "projectId" = current_setting('app.project_id', true)
  );
