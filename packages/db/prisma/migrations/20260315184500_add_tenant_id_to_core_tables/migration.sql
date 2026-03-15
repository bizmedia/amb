-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Thread" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Message" ADD COLUMN "tenantId" TEXT;

-- CreateIndex
CREATE INDEX "Agent_tenantId_idx" ON "Agent"("tenantId");
CREATE INDEX "Agent_tenantId_projectId_idx" ON "Agent"("tenantId", "projectId");

CREATE INDEX "Thread_tenantId_idx" ON "Thread"("tenantId");
CREATE INDEX "Thread_tenantId_projectId_idx" ON "Thread"("tenantId", "projectId");

CREATE INDEX "Message_tenantId_idx" ON "Message"("tenantId");
CREATE INDEX "Message_tenantId_projectId_idx" ON "Message"("tenantId", "projectId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
