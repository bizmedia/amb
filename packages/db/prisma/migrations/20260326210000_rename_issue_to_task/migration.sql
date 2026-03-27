-- Rename enums (columns keep same underlying type OID)
ALTER TYPE "IssueState" RENAME TO "TaskState";
ALTER TYPE "IssuePriority" RENAME TO "TaskPriority";

-- Rename table and constraints
ALTER TABLE "Issue" RENAME TO "Task";
ALTER TABLE "Task" RENAME CONSTRAINT "Issue_pkey" TO "Task_pkey";
ALTER TABLE "Task" RENAME CONSTRAINT "Issue_projectId_fkey" TO "Task_projectId_fkey";
ALTER TABLE "Task" RENAME CONSTRAINT "Issue_assigneeId_fkey" TO "Task_assigneeId_fkey";

ALTER INDEX "Issue_projectId_idx" RENAME TO "Task_projectId_idx";
ALTER INDEX "Issue_state_idx" RENAME TO "Task_state_idx";
ALTER INDEX "Issue_priority_idx" RENAME TO "Task_priority_idx";
ALTER INDEX "Issue_assigneeId_idx" RENAME TO "Task_assigneeId_idx";
ALTER INDEX "Issue_dueDate_idx" RENAME TO "Task_dueDate_idx";
ALTER INDEX "Issue_projectId_key_key" RENAME TO "Task_projectId_key_key";
ALTER INDEX "Issue_key_idx" RENAME TO "Task_key_idx";
