import { cleanupOldMessages } from "../lib/services/messages";

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || "30", 10);

async function main() {
  console.log(`[cleanup] Cleaning messages older than ${RETENTION_DAYS} days...`);

  const result = await cleanupOldMessages(RETENTION_DAYS);

  console.log(`[cleanup] Deleted: ${result.deleted} messages`);
  console.log("[cleanup] Done.");

  process.exit(0);
}

main().catch((err) => {
  console.error("[cleanup] Error:", err);
  process.exit(1);
});
