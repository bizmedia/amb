-- CreateTable
CREATE TABLE "MessageTaskLink" (
    "messageId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageTaskLink_pkey" PRIMARY KEY ("messageId","taskId")
);

-- CreateIndex
CREATE INDEX "MessageTaskLink_projectId_taskId_idx" ON "MessageTaskLink"("projectId", "taskId");

-- CreateIndex
CREATE INDEX "MessageTaskLink_projectId_messageId_idx" ON "MessageTaskLink"("projectId", "messageId");

-- CreateIndex
CREATE INDEX "MessageTaskLink_tenantId_projectId_idx" ON "MessageTaskLink"("tenantId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_projectId_id_key" ON "Message"("projectId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_projectId_id_key" ON "Task"("projectId", "id");

-- AddForeignKey
ALTER TABLE "MessageTaskLink" ADD CONSTRAINT "MessageTaskLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTaskLink" ADD CONSTRAINT "MessageTaskLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTaskLink" ADD CONSTRAINT "MessageTaskLink_projectId_messageId_fkey" FOREIGN KEY ("projectId", "messageId") REFERENCES "Message"("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTaskLink" ADD CONSTRAINT "MessageTaskLink_projectId_taskId_fkey" FOREIGN KEY ("projectId", "taskId") REFERENCES "Task"("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
ALTER TABLE "MessageTaskLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageTaskLink" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS message_task_link_rls_select ON "MessageTaskLink";
DROP POLICY IF EXISTS message_task_link_rls_insert ON "MessageTaskLink";
DROP POLICY IF EXISTS message_task_link_rls_update ON "MessageTaskLink";
DROP POLICY IF EXISTS message_task_link_rls_delete ON "MessageTaskLink";

CREATE POLICY message_task_link_rls_select ON "MessageTaskLink"
  FOR SELECT
  USING (
    "projectId" = current_setting('app.project_id', true)
    AND (
      current_setting('app.tenant_id', true) IS NULL
      OR "tenantId" IS NULL
      OR "tenantId" = current_setting('app.tenant_id', true)
    )
  );

CREATE POLICY message_task_link_rls_insert ON "MessageTaskLink"
  FOR INSERT
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
    AND (
      current_setting('app.tenant_id', true) IS NULL
      OR "tenantId" IS NULL
      OR "tenantId" = current_setting('app.tenant_id', true)
    )
  );

CREATE POLICY message_task_link_rls_update ON "MessageTaskLink"
  FOR UPDATE
  USING (
    "projectId" = current_setting('app.project_id', true)
    AND (
      current_setting('app.tenant_id', true) IS NULL
      OR "tenantId" IS NULL
      OR "tenantId" = current_setting('app.tenant_id', true)
    )
  )
  WITH CHECK (
    "projectId" = current_setting('app.project_id', true)
    AND (
      current_setting('app.tenant_id', true) IS NULL
      OR "tenantId" IS NULL
      OR "tenantId" = current_setting('app.tenant_id', true)
    )
  );

CREATE POLICY message_task_link_rls_delete ON "MessageTaskLink"
  FOR DELETE
  USING (
    "projectId" = current_setting('app.project_id', true)
    AND (
      current_setting('app.tenant_id', true) IS NULL
      OR "tenantId" IS NULL
      OR "tenantId" = current_setting('app.tenant_id', true)
    )
  );
