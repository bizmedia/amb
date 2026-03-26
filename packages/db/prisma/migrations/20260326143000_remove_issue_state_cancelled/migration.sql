-- Re-map deprecated state before shrinking enum
UPDATE "Issue" SET "state" = 'DONE' WHERE "state" = 'CANCELLED';

-- Replace enum (Postgres cannot drop enum values in place)
CREATE TYPE "IssueState_new" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE');

ALTER TABLE "Issue" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Issue" ALTER COLUMN "state" TYPE "IssueState_new" USING ("state"::text::"IssueState_new");
ALTER TABLE "Issue" ALTER COLUMN "state" SET DEFAULT 'BACKLOG'::"IssueState_new";

DROP TYPE "IssueState";
ALTER TYPE "IssueState_new" RENAME TO "IssueState";
