import "dotenv/config";
import { retryTimedOutMessages } from "../lib/services/messages";

async function main() {
  console.log("[retry-worker] Starting retry cycle...");

  const results = await retryTimedOutMessages();

  console.log(`[retry-worker] Retried: ${results.retried}`);
  console.log(`[retry-worker] Moved to DLQ: ${results.movedToDlq}`);
  console.log("[retry-worker] Done.");

  process.exit(0);
}

main().catch((err) => {
  console.error("[retry-worker] Error:", err);
  process.exit(1);
});
