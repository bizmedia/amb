-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- Seed default project
INSERT INTO "Project" ("id", "name", "slug")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Project', 'default')
ON CONFLICT ("slug") DO NOTHING;

-- Add projectId columns (nullable for backfill)
ALTER TABLE "Agent" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Thread" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Message" ADD COLUMN "projectId" TEXT;

-- Backfill existing rows into default project
UPDATE "Agent" SET "projectId" = '00000000-0000-0000-0000-000000000001' WHERE "projectId" IS NULL;
UPDATE "Thread" SET "projectId" = '00000000-0000-0000-0000-000000000001' WHERE "projectId" IS NULL;
UPDATE "Message" SET "projectId" = '00000000-0000-0000-0000-000000000001' WHERE "projectId" IS NULL;

-- Make projectId required
ALTER TABLE "Agent" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "Thread" ALTER COLUMN "projectId" SET NOT NULL;
ALTER TABLE "Message" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Agent_projectId_idx" ON "Agent"("projectId");

-- CreateIndex
CREATE INDEX "Thread_projectId_idx" ON "Thread"("projectId");

-- CreateIndex
CREATE INDEX "Message_projectId_idx" ON "Message"("projectId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
