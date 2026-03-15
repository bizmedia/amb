-- Enable RLS on project-scoped tables
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Issue" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Agent" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Thread" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Message" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Issue" FORCE ROW LEVEL SECURITY;

-- Agent policies
DROP POLICY IF EXISTS agent_rls_select ON "Agent";
DROP POLICY IF EXISTS agent_rls_insert ON "Agent";
DROP POLICY IF EXISTS agent_rls_update ON "Agent";
DROP POLICY IF EXISTS agent_rls_delete ON "Agent";

CREATE POLICY agent_rls_select ON "Agent"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY agent_rls_insert ON "Agent"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY agent_rls_update ON "Agent"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY agent_rls_delete ON "Agent"
  FOR DELETE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

-- Thread policies
DROP POLICY IF EXISTS thread_rls_select ON "Thread";
DROP POLICY IF EXISTS thread_rls_insert ON "Thread";
DROP POLICY IF EXISTS thread_rls_update ON "Thread";
DROP POLICY IF EXISTS thread_rls_delete ON "Thread";

CREATE POLICY thread_rls_select ON "Thread"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY thread_rls_insert ON "Thread"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY thread_rls_update ON "Thread"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY thread_rls_delete ON "Thread"
  FOR DELETE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

-- Message policies
DROP POLICY IF EXISTS message_rls_select ON "Message";
DROP POLICY IF EXISTS message_rls_insert ON "Message";
DROP POLICY IF EXISTS message_rls_update ON "Message";
DROP POLICY IF EXISTS message_rls_delete ON "Message";

CREATE POLICY message_rls_select ON "Message"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY message_rls_insert ON "Message"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY message_rls_update ON "Message"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY message_rls_delete ON "Message"
  FOR DELETE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

-- Issue policies
DROP POLICY IF EXISTS issue_rls_select ON "Issue";
DROP POLICY IF EXISTS issue_rls_insert ON "Issue";
DROP POLICY IF EXISTS issue_rls_update ON "Issue";
DROP POLICY IF EXISTS issue_rls_delete ON "Issue";

CREATE POLICY issue_rls_select ON "Issue"
  FOR SELECT
  USING (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY issue_rls_insert ON "Issue"
  FOR INSERT
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY issue_rls_update ON "Issue"
  FOR UPDATE
  USING (
    "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY issue_rls_delete ON "Issue"
  FOR DELETE
  USING (
    "projectId" = current_setting('app.project_id', true)
  );
