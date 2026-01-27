-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_toAgentId_idx" ON "Message"("toAgentId");

-- CreateIndex
CREATE INDEX "Message_fromAgentId_idx" ON "Message"("fromAgentId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");
