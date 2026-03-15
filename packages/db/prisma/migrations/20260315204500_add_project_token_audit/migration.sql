-- CreateTable
CREATE TABLE "ProjectTokenAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTokenAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectTokenAudit_tenantId_idx" ON "ProjectTokenAudit"("tenantId");
CREATE INDEX "ProjectTokenAudit_projectId_idx" ON "ProjectTokenAudit"("projectId");
CREATE INDEX "ProjectTokenAudit_tokenId_idx" ON "ProjectTokenAudit"("tokenId");
CREATE INDEX "ProjectTokenAudit_event_idx" ON "ProjectTokenAudit"("event");
CREATE INDEX "ProjectTokenAudit_createdAt_idx" ON "ProjectTokenAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "ProjectTokenAudit" ADD CONSTRAINT "ProjectTokenAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTokenAudit" ADD CONSTRAINT "ProjectTokenAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTokenAudit" ADD CONSTRAINT "ProjectTokenAudit_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ProjectToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "ProjectTokenAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectTokenAudit" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_token_audit_rls_select ON "ProjectTokenAudit";
DROP POLICY IF EXISTS project_token_audit_rls_insert ON "ProjectTokenAudit";

CREATE POLICY project_token_audit_rls_select ON "ProjectTokenAudit"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY project_token_audit_rls_insert ON "ProjectTokenAudit"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );
