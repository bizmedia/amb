-- CreateTable
CREATE TABLE "ProjectToken" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectToken_tokenHash_key" ON "ProjectToken"("tokenHash");
CREATE INDEX "ProjectToken_tenantId_idx" ON "ProjectToken"("tenantId");
CREATE INDEX "ProjectToken_projectId_idx" ON "ProjectToken"("projectId");
CREATE INDEX "ProjectToken_tenantId_projectId_idx" ON "ProjectToken"("tenantId", "projectId");
CREATE INDEX "ProjectToken_revokedAt_idx" ON "ProjectToken"("revokedAt");

-- AddForeignKey
ALTER TABLE "ProjectToken" ADD CONSTRAINT "ProjectToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectToken" ADD CONSTRAINT "ProjectToken_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE "ProjectToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectToken" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_token_rls_select ON "ProjectToken";
DROP POLICY IF EXISTS project_token_rls_insert ON "ProjectToken";
DROP POLICY IF EXISTS project_token_rls_update ON "ProjectToken";
DROP POLICY IF EXISTS project_token_rls_delete ON "ProjectToken";

CREATE POLICY project_token_rls_select ON "ProjectToken"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY project_token_rls_insert ON "ProjectToken"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY project_token_rls_update ON "ProjectToken"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );

CREATE POLICY project_token_rls_delete ON "ProjectToken"
  FOR DELETE
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    AND "projectId" = current_setting('app.project_id', true)
  );
