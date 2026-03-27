-- Widen text columns / defaults. Must run after taskPrefix+key exist (20260326160000)
-- and after Issue → Task rename (20260326210000); older timestamp 20260326143530_init failed (P3009).
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "taskPrefix" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ProjectToken" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "key" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
