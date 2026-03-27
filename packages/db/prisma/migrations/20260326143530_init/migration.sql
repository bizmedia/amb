-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "taskPrefix" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ProjectToken" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "key" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
